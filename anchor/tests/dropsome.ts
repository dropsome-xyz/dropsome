import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Dropsome } from "../target/types/dropsome";
import * as web3 from "@solana/web3.js";
import { expect } from "chai";

const NETWORK_FEE_RESERVE_LAMPORTS: number = 1_000_000;
const FEE_BASIS_POINTS: number = 100; // 1% in basis points
const MIN_DROP_AMOUNT_LAMPORTS: number = 1_000_000;

describe("dropsome", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Dropsome as Program<Dropsome>;

  const amount = 1 * web3.LAMPORTS_PER_SOL;
  const recordDataSize = 112;

  async function setupAccounts() {
    const sender = web3.Keypair.generate();
    const receiver = web3.Keypair.generate();

    await airdrop(provider.connection, sender.publicKey);

    const initialSenderBalance = await provider.connection.getBalance(sender.publicKey, "confirmed");
    const rentDeposit = await provider.connection.getMinimumBalanceForRentExemption(recordDataSize);

    const [vault] = web3.PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("vault"),
      sender.publicKey.toBuffer(),
      receiver.publicKey.toBuffer()
    ],
      program.programId
    );

    const [record] = web3.PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("record"),
      sender.publicKey.toBuffer(),
      receiver.publicKey.toBuffer()
    ],
      program.programId
    );

    return { sender, receiver, vault, record, initialSenderBalance, rentDeposit };
  }

  describe("Initialize app state", () => {
    it("The app is successfully initialized with the correct parameters", async () => {
      const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);

      const authority = provider.wallet;
      const treasury = web3.Keypair.generate().publicKey;
      const params = {
        authority: authority.publicKey,
        isActive: true,
        networkFeeReserve: new BN(NETWORK_FEE_RESERVE_LAMPORTS),
        treasury,
        feeBasisPoints: FEE_BASIS_POINTS,
        minDropAmount: new BN(MIN_DROP_AMOUNT_LAMPORTS),
      };

      await program.methods
        .initialize(params)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority.payer])
        .rpc({ commitment: "confirmed" });

      const appState = await program.account.appState.fetch(appStatePda);
      expect(appState.isInitialized).to.be.true;
      expect(appState.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(appState.isActive).to.be.true;
      expect(appState.networkFeeReserve.toNumber()).to.equal(NETWORK_FEE_RESERVE_LAMPORTS);
      expect(appState.treasury.toBase58()).to.equal(treasury.toBase58());
      expect(appState.feeBasisPoints).to.equal(FEE_BASIS_POINTS);
    });

    it("The app initialization fails when re-initialization is attempted", async () => {
      const authority = provider.wallet;
      const treasury = web3.Keypair.generate().publicKey;
      const params = {
        authority: authority.publicKey,
        isActive: true,
        networkFeeReserve: new BN(NETWORK_FEE_RESERVE_LAMPORTS),
        treasury,
        feeBasisPoints: FEE_BASIS_POINTS,
        minDropAmount: new BN(MIN_DROP_AMOUNT_LAMPORTS),
      };

      try {
        await program.methods
          .initialize(params)
          .accounts({
            authority: authority.publicKey,
          })
          .signers([authority.payer])
          .rpc({ commitment: "confirmed" });
        expect.fail();
      } catch (e) {
        expect(e.transactionLogs).to.include('Program log: Instruction: Initialize');
        expect(e.transactionLogs).to.include('Program 11111111111111111111111111111111 failed: custom program error: 0x0');
      }
    });
  });

  describe("Update app state", () => {
    let appStatePda: web3.PublicKey;
    let authority: any;
    let treasury: web3.PublicKey;
    let params: any;

    beforeEach("Initialize app state", async () => {
      [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);
      authority = provider.wallet;
      treasury = web3.Keypair.generate().publicKey;
      params = {
        authority: authority.publicKey,
        isActive: true,
        networkFeeReserve: new BN(NETWORK_FEE_RESERVE_LAMPORTS),
        treasury,
        feeBasisPoints: FEE_BASIS_POINTS,
        minDropAmount: new BN(MIN_DROP_AMOUNT_LAMPORTS),
      };

      try {
        await program.methods
          .initialize(params)
          .accounts({ authority: authority.publicKey })
          .signers([authority.payer])
          .rpc({ commitment: "confirmed" });
      } catch (e) {
        // ignore if already initialized
      }
    });

    it("Authority can update isActive", async () => {
      await program.methods
        .updateState({ ...params, isActive: false })
        .accounts({ authority: authority.publicKey, appState: appStatePda })
        .signers([authority.payer])
        .rpc({ commitment: "confirmed" });
      const appState = await program.account.appState.fetch(appStatePda);
      expect(appState.isActive).to.be.false;
    });

    it("Authority can update networkFeeReserve", async () => {
      await program.methods
        .updateState({ ...params, networkFeeReserve: new BN(5_000_000) })
        .accounts({ authority: authority.publicKey, appState: appStatePda })
        .signers([authority.payer])
        .rpc({ commitment: "confirmed" });
      const appState = await program.account.appState.fetch(appStatePda);
      expect(appState.networkFeeReserve.toNumber()).to.equal(5_000_000);
    });

    it("Authority can update treasury", async () => {
      const newTreasury = web3.Keypair.generate().publicKey;
      await program.methods
        .updateState({ ...params, treasury: newTreasury })
        .accounts({ authority: authority.publicKey, appState: appStatePda })
        .signers([authority.payer])
        .rpc({ commitment: "confirmed" });
      const appState = await program.account.appState.fetch(appStatePda);
      expect(appState.treasury.toBase58()).to.equal(newTreasury.toBase58());
    });

    it("Authority can update feeBasisPoints", async () => {
      await program.methods
        .updateState({ ...params, feeBasisPoints: 300 })
        .accounts({ authority: authority.publicKey, appState: appStatePda })
        .signers([authority.payer])
        .rpc({ commitment: "confirmed" });
      const appState = await program.account.appState.fetch(appStatePda);
      expect(appState.feeBasisPoints).to.equal(300);
    });

    it("Fails if feeBasisPoints is too high", async () => {
      try {
        await program.methods
          .updateState({ ...params, feeBasisPoints: 10_001 })
          .accounts({ authority: authority.publicKey, appState: appStatePda })
          .signers([authority.payer])
          .rpc({ commitment: "confirmed" });
        expect.fail();
      } catch (e) {
        const feeTooHighError = program.idl.errors.find(
          (err) => err.name === "feeBasisPointsTooHigh"
        );
        expect(feeTooHighError, 'Custom error not found in IDL').to.exist;
        expect(e.error.errorCode.number).to.equal(feeTooHighError.code);
        expect(e.error.errorMessage).to.equal(feeTooHighError.msg);
      }
    });

    it("Authority can update authority (transfer authority)", async () => {
      const newAuthority = web3.Keypair.generate();
      await program.methods
        .updateState({ ...params, authority: newAuthority.publicKey })
        .accounts({ authority: authority.publicKey, appState: appStatePda })
        .signers([authority.payer])
        .rpc({ commitment: "confirmed" });
      const appState = await program.account.appState.fetch(appStatePda);
      expect(appState.authority.toBase58()).to.equal(newAuthority.publicKey.toBase58());
    });

    it("Fails if not initialized", async () => {
      // close and re-create appState PDA with is_initialized = false
      // For simplicity, simulate by using a new PDA (not possible in prod, but for test coverage)
      const fakeAppState = web3.Keypair.generate();
      try {
        await program.methods
          .updateState({ ...params, isActive: false })
          .accounts({ authority: authority.publicKey, appState: fakeAppState.publicKey })
          .signers([authority.payer])
          .rpc({ commitment: "confirmed" });
        expect.fail();
      } catch (e) {
        expect(e.error.errorCode.number).to.equal(anchor.LangErrorCode.AccountNotInitialized);
      }
    });

    it("Fails if called by non-authority", async () => {
      const notAuthority = web3.Keypair.generate();
      await airdrop(provider.connection, notAuthority.publicKey);
      try {
        await program.methods
          .updateState({ ...params, isActive: false })
          .accounts({ authority: notAuthority.publicKey, appState: appStatePda })
          .signers([notAuthority])
          .rpc({ commitment: "confirmed" });
        expect.fail();
      } catch (e) {
        expect(e.error.errorCode.number).to.equal(anchor.LangErrorCode.ConstraintRaw);
      }
    });
  });

  describe("Drop and Claim", () => {
    let sender: web3.Keypair;
    let receiver: web3.Keypair;
    let vault: web3.PublicKey;
    let record: web3.PublicKey;
    let initialSenderBalance: number;
    let rentDeposit: number;
    let treasury: web3.PublicKey;

    before("Setup", async () => {
      const setup = await setupAccounts();
      ({ sender, receiver, vault, record, initialSenderBalance, rentDeposit } = setup);

      const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);

      const appState = await program.account.appState.fetch(appStatePda);
      treasury = appState.treasury;
    });

    it("Sender drops some funds into the vault", async () => {
      const tx = await program.methods
        .drop(new BN(amount))
        .accounts({
          sender: sender.publicKey,
          receiver: receiver.publicKey,
        })
        .remainingAccounts([
          {
            pubkey: treasury,
            isWritable: true,
            isSigner: false,
          }
        ])
        .signers([sender])
        .rpc({ commitment: "confirmed" });

      console.log("Transaction signature", tx);

      const senderBalance = await provider.connection.getBalance(sender.publicKey, "confirmed");
      const vaultRentDeposit = await provider.connection.getMinimumBalanceForRentExemption(0);
      const vaultBalance = await provider.connection.getBalance(vault, "confirmed");
      const serviceFee = Math.floor(amount * FEE_BASIS_POINTS / 10000);

      expect(senderBalance).to.equal(initialSenderBalance - amount - vaultRentDeposit - rentDeposit - NETWORK_FEE_RESERVE_LAMPORTS - serviceFee);
      expect(vaultBalance).to.equal(amount + vaultRentDeposit);
    });

    it("Receiver claims the funds", async () => {
      const tx = await program.methods
        .claim()
        .accounts({
          receiver: receiver.publicKey,
          sender: sender.publicKey,
        })
        .accountsPartial({
          record: record,
        })
        .signers([receiver])
        .rpc({ commitment: "confirmed" });

      console.log("Transaction signature", tx);

      const receiverBalance = await provider.connection.getBalance(receiver.publicKey, "confirmed");
      const vaultBalance = await provider.connection.getBalance(vault, "confirmed");
      const recordBalance = await provider.connection.getBalance(record, "confirmed");

      expect(receiverBalance).to.equal(amount + NETWORK_FEE_RESERVE_LAMPORTS);
      expect(vaultBalance).to.equal(0);
      expect(recordBalance).to.equal(0);

      try {
        await program.account.record.fetch(record);
      } catch (error) {
        expect(error.message).to.contain("Account does not exist or has no data");
      }
    });
  });

  describe("Drop and Refund", () => {
    let sender: web3.Keypair;
    let receiver: web3.Keypair;
    let vault: web3.PublicKey;
    let record: web3.PublicKey;
    let initialSenderBalance: number;
    let rentDeposit: number;
    let treasury: web3.PublicKey;

    before("Setup", async () => {
      const setup = await setupAccounts();
      ({ sender, receiver, vault, record, initialSenderBalance, rentDeposit } = setup);

      const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);

      const appState = await program.account.appState.fetch(appStatePda);
      treasury = appState.treasury;
    });

    it("Sender drops some funds into the vault", async () => {
      const tx = await program.methods
        .drop(new BN(amount))
        .accounts({
          sender: sender.publicKey,
          receiver: receiver.publicKey,
          treasury: treasury,
        })
        .signers([sender])
        .rpc({ commitment: "confirmed" });

      console.log("Transaction signature", tx);

      const senderBalance = await provider.connection.getBalance(sender.publicKey, "confirmed");
      const vaultRentDeposit = await provider.connection.getMinimumBalanceForRentExemption(0);
      const vaultBalance = await provider.connection.getBalance(vault, "confirmed");
      const serviceFee = Math.floor(amount * FEE_BASIS_POINTS / 10000);

      expect(senderBalance).to.equal(initialSenderBalance - amount - vaultRentDeposit - rentDeposit - NETWORK_FEE_RESERVE_LAMPORTS - serviceFee);
      expect(vaultBalance).to.equal(amount + vaultRentDeposit);
    });

    it("Sender returns unclaimed funds", async () => {
      const tx = await program.methods
        .refund()
        .accounts({
          sender: sender.publicKey,
        })
        .accountsPartial({
          record: record,
        })
        .signers([sender])
        .rpc({ commitment: "confirmed" });

      console.log("Transaction signature", tx);

      const senderBalance = await provider.connection.getBalance(sender.publicKey, "confirmed");
      const vaultBalance = await provider.connection.getBalance(vault, "confirmed");
      const recordBalance = await provider.connection.getBalance(record, "confirmed");
      const serviceFee = Math.floor(amount * FEE_BASIS_POINTS / 10000);

      expect(senderBalance).to.equal(initialSenderBalance - NETWORK_FEE_RESERVE_LAMPORTS - serviceFee);
      expect(vaultBalance).to.equal(0);
      expect(recordBalance).to.equal(0);

      try {
        await program.account.record.fetch(record);
      } catch (error) {
        expect(error.message).to.contain("Account does not exist or has no data");
      }
    });
  });

  describe("Drop funds failed", () => {
    let sender: web3.Keypair;
    let receiver: web3.Keypair;
    let treasury: web3.PublicKey;

    before("Setup", async () => {
      const setup = await setupAccounts();
      ({ sender, receiver } = setup);

      const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);

      const appState = await program.account.appState.fetch(appStatePda);
      treasury = appState.treasury;
    });

    it("Drop failed because the amount was too small", async () => {
      try {
        await program.methods
          .drop(new BN(0))
          .accounts({
            sender: sender.publicKey,
            receiver: receiver.publicKey,
            treasury: treasury,
          })
          .signers([sender])
          .rpc({ commitment: "confirmed" });
      } catch (err) {
        const amountTooSmallError = program.idl.errors.find(
          (e: { name: string }) => e.name === "insufficientDropAmount"
        );
        expect(amountTooSmallError, 'Custom error not found in IDL').to.exist;
        expect(err.error.errorCode.number).to.equal(amountTooSmallError.code);
        expect(err.error.errorMessage).to.equal("The drop amount is below the minimum allowed amount.");
      }
    });

    it("Drop failed because the receiver account has a non-zero balance", async () => {
      const unexpectedReceiver = web3.Keypair.generate();
      await airdrop(provider.connection, unexpectedReceiver.publicKey);
      try {
        await program.methods
          .drop(new BN(amount))
          .accounts({
            sender: sender.publicKey,
            receiver: unexpectedReceiver.publicKey,
            treasury: treasury,
          })
          .signers([sender])
          .rpc({ commitment: "confirmed" });

        expect.fail();
      } catch (err) {
        const receiverBalanceNotEmptyError = program.idl.errors.find(
          (e: { name: string }) => e.name === "receiverBalanceNotEmpty"
        );
        expect(receiverBalanceNotEmptyError, 'Custom error not found in IDL').to.exist;
        expect(err.error.errorCode.number).to.equal(receiverBalanceNotEmptyError.code);
        expect(err.error.errorMessage).to.equal(receiverBalanceNotEmptyError.msg);
      }
    });
  });

  describe("Claim funds failed", () => {
    let sender: web3.Keypair;
    let receiver: web3.Keypair;
    let record: web3.PublicKey;
    let treasury: web3.PublicKey;

    before("Setup", async () => {
      const setup = await setupAccounts();
      ({ sender, receiver, record } = setup);

      const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);

      const appState = await program.account.appState.fetch(appStatePda);
      treasury = appState.treasury;
    });


    it("Claim failed because the receiver wasn't authorized", async () => {
      let tx = await program.methods
        .drop(new BN(amount))
        .accounts({
          sender: sender.publicKey,
          receiver: receiver.publicKey,
          treasury: treasury,
        })
        .signers([sender])
        .rpc({ commitment: "confirmed" });

      console.log("Transaction signature", tx);

      const unknownReceiver = web3.Keypair.generate();

      try {
        await program.methods
          .claim()
          .accounts({
            receiver: unknownReceiver.publicKey,
            sender: sender.publicKey,
          })
          .accountsPartial({
            record: record,
          })
          .signers([unknownReceiver])
          .rpc({ commitment: "confirmed" });

        expect.fail();
      } catch (err) {
        expect(err.error.errorCode.number).to.equal(anchor.LangErrorCode.ConstraintSeeds);
      }
    });
  });

  describe("Refund funds failed", () => {
    let sender: web3.Keypair;
    let receiver: web3.Keypair;
    let record: web3.PublicKey;
    let treasury: web3.PublicKey;

    before("Setup", async () => {
      const setup = await setupAccounts();
      ({ sender, receiver, record } = setup);

      const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
      ], program.programId);

      const appState = await program.account.appState.fetch(appStatePda);
      treasury = appState.treasury;
    });

    it("Refund failed because the sender wasn't authorized", async () => {
      let tx = await program.methods
        .drop(new BN(amount))
        .accounts({
          sender: sender.publicKey,
          receiver: receiver.publicKey,
          treasury: treasury,
        })
        .signers([sender])
        .rpc({ commitment: "confirmed" });

      console.log("Transaction signature", tx);

      const unknownSender = web3.Keypair.generate();

      try {
        await program.methods
          .refund()
          .accounts({
            sender: unknownSender.publicKey,
          })
          .accountsPartial({
            record: record,
          })
          .signers([unknownSender])
          .rpc({ commitment: "confirmed" });

        expect.fail();
      } catch (err) {
        expect(err.error.errorCode.number).to.equal(anchor.LangErrorCode.ConstraintSeeds);
      }
    });
  });

});

async function airdrop(connection: any, address: any, amount = 10 * anchor.web3.LAMPORTS_PER_SOL) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
