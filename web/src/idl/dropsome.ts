/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dropsome.json`.
 */
export type Dropsome = {
  "address": "DSdHwC1vGPL4KzNAhgxMYggZnBBaY8upKx6uo655kVYZ",
  "metadata": {
    "name": "dropsome",
    "version": "0.7.0",
    "spec": "0.1.0",
    "description": "Dropsome is a DeFi app for sharing funds with newcomers"
  },
  "instructions": [
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "receiver",
          "writable": true,
          "signer": true,
          "relations": [
            "record"
          ]
        },
        {
          "name": "sender",
          "writable": true,
          "relations": [
            "record"
          ]
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "record.sender",
                "account": "record"
              },
              {
                "kind": "account",
                "path": "receiver"
              }
            ]
          },
          "relations": [
            "record"
          ]
        },
        {
          "name": "record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "record.sender",
                "account": "record"
              },
              {
                "kind": "account",
                "path": "receiver"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "drop",
      "discriminator": [
        91,
        71,
        28,
        206,
        130,
        176,
        162,
        145
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              },
              {
                "kind": "account",
                "path": "receiver"
              }
            ]
          }
        },
        {
          "name": "record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              },
              {
                "kind": "account",
                "path": "receiver"
              }
            ]
          }
        },
        {
          "name": "appState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "relations": [
            "appState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "appState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "programData",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  184,
                  220,
                  204,
                  126,
                  130,
                  34,
                  119,
                  146,
                  141,
                  38,
                  206,
                  229,
                  247,
                  151,
                  255,
                  122,
                  201,
                  248,
                  58,
                  60,
                  25,
                  125,
                  32,
                  59,
                  174,
                  116,
                  139,
                  41,
                  46,
                  165,
                  58,
                  206
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                2,
                168,
                246,
                145,
                78,
                136,
                161,
                176,
                226,
                16,
                21,
                62,
                247,
                99,
                174,
                43,
                0,
                194,
                185,
                61,
                22,
                193,
                36,
                210,
                192,
                83,
                122,
                16,
                4,
                128,
                0,
                0
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "parameters",
          "type": {
            "defined": {
              "name": "appStateParameters"
            }
          }
        }
      ]
    },
    {
      "name": "refund",
      "discriminator": [
        2,
        96,
        183,
        251,
        63,
        208,
        46,
        46
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true,
          "relations": [
            "record"
          ]
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              },
              {
                "kind": "account",
                "path": "record.receiver",
                "account": "record"
              }
            ]
          },
          "relations": [
            "record"
          ]
        },
        {
          "name": "record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              },
              {
                "kind": "account",
                "path": "record.receiver",
                "account": "record"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateState",
      "discriminator": [
        135,
        112,
        215,
        75,
        247,
        185,
        53,
        176
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "appState"
          ]
        },
        {
          "name": "appState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "programData",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  184,
                  220,
                  204,
                  126,
                  130,
                  34,
                  119,
                  146,
                  141,
                  38,
                  206,
                  229,
                  247,
                  151,
                  255,
                  122,
                  201,
                  248,
                  58,
                  60,
                  25,
                  125,
                  32,
                  59,
                  174,
                  116,
                  139,
                  41,
                  46,
                  165,
                  58,
                  206
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                2,
                168,
                246,
                145,
                78,
                136,
                161,
                176,
                226,
                16,
                21,
                62,
                247,
                99,
                174,
                43,
                0,
                194,
                185,
                61,
                22,
                193,
                36,
                210,
                192,
                83,
                122,
                16,
                4,
                128,
                0,
                0
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "parameters",
          "type": {
            "defined": {
              "name": "appStateParameters"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "appState",
      "discriminator": [
        217,
        117,
        146,
        200,
        12,
        223,
        18,
        55
      ]
    },
    {
      "name": "record",
      "discriminator": [
        254,
        233,
        117,
        252,
        76,
        166,
        146,
        139
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientDropAmount",
      "msg": "The drop amount is below the minimum allowed amount."
    },
    {
      "code": 6001,
      "name": "receiverBalanceNotEmpty",
      "msg": "The receiver account has a non-zero balance."
    },
    {
      "code": 6002,
      "name": "unauthorizedClaim",
      "msg": "Only the designated receiver can claim these funds."
    },
    {
      "code": 6003,
      "name": "appStateAlreadyInitialized",
      "msg": "The app state is already initialized."
    },
    {
      "code": 6004,
      "name": "feeBasisPointsTooHigh",
      "msg": "The fee basis points value is too high (max 10,000 = 100%)."
    },
    {
      "code": 6005,
      "name": "appNotActive",
      "msg": "The app is not active."
    }
  ],
  "types": [
    {
      "name": "appState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "networkFeeReserve",
            "type": "u64"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          },
          {
            "name": "minDropAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "appStateParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "networkFeeReserve",
            "type": "u64"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          },
          {
            "name": "minDropAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "record",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
