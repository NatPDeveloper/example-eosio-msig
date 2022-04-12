const proposer = "zlwb4mcq322g"; // msig proposer account
const privateKey = ""; // msig proposer private key
const proposerPermissionLevel = "active"; // permission level for account
const expiration = '2023-03-29T23:11:48'; // expiration date where msig expires
const proposalName = 'proxyrex'; // name of proposal, must meet eosio naming standards less than 13 characters, a-z,1-5
const dappGovOwner = [
    {"actor":"cbrftbkrwwbo","permission":"active"},
    {"actor":"codeguardian","permission":"active"},
    {"actor":"cryptolions1","permission":"gov"},
    {"actor":"dappnetworkk","permission":"active"},
    {"actor":"dappprovider","permission":"active"},
    {"actor":"doobiegalnew","permission":"active"},
    {"actor":"eospheredapp","permission":"active"},
    {"actor":"everythngeos","permission":"active"},
    {"actor":"igorlseosrio","permission":"guardian"},
    {"actor":"ihaveadejavu","permission":"active"},
    {"actor":"investingwad","permission":"active"},
    {"actor":"kawrrsytrsbq","permission":"active"},
    {"actor":"kobybenaroya","permission":"active"},
    {"actor":"larosenonaka","permission":"active"},
    {"actor":"mithrilalnce","permission":"active"},
    {"actor":"mwguardian12","permission":"active"},
    {"actor":"prjyzjtgxuku","permission":"active"},
    {"actor":"talmuskaleos","permission":"active"},
    {"actor":"x452ifggq5va","permission":"active"},
    {"actor":"xhfq33vt3fg2","permission":"active"},
    {"actor":"zkwshzdsgdiv","permission":"active"}
];

// list of actions to propose in multi sig
const actions = [
    {
        "account": "eosio",
        "name": "voteproducer",
        "data": {
          "voter": "dappgovfunds",
          "proxy": "proxy4nation",
          "producers": []
        },
        "authorization": [
            {
              "actor": "dappgovfunds",
              "permission": "active"
            }
        ]
    },
    {
        "account": "eosio",
        "name": "deposit",
        "data": {
            "owner": "dappgovfunds",
            "amount": "20877.0000 EOS"
        },
        "authorization": [
            {
                "actor": "dappgovfunds",
                "permission": "active"
            }
        ]
    },
    {
        "account": "eosio",
        "name": "buyrex",
        "data": {
            "from": "dappgovfunds",
            "amount": "20877.0000 EOS"
        },
        "authorization": [
            {
                "actor": "dappgovfunds",
                "permission": "active"
            }
        ]
    },
    {
        "account": "proxy4nation",
        "name": "signup",
        "data": {
          "owner": "dappgovfunds"
        },
        "authorization": [
          {
            "actor": "dappgovfunds",
            "permission": "active"
          }
        ]
    }
    // add more actions
    // ,{
    //     account: "",
    //     name: "transfer",
    //     authorization: [
    //         {
    //             actor: msigAuthAccount,
    //             permission
    //         }
    //     ],
    //     data: {
    //         from: "",
    //         to:"",
    //         quantity:"",
    //         memo:"recover tokens"
    //     }
    // },
    // {
    //     "account": "eosio",
    //     "name": "delegatebw",
    //     "data": {
    //       "from": "dappgovfunds",
    //       "receiver": "dappgovfunds",
    //       "stake_net_quantity": "5219.2500 EOS",
    //       "stake_cpu_quantity": "15657.7500 EOS",
    //       "transfer": false
    //     },
    //     "authorization": [
    //       {
    //         "actor": "dappgovfunds",
    //         "permission": "owner"
    //       }
    //     ]
    // },
];

// end stuff to update

const rpcUrl = 'https://mainnet.eosn.io';  // https://eos.greymass.com

const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');
const signatureProvider = new JsSignatureProvider([privateKey]);
const rpc = new JsonRpc(rpcUrl, { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const proposeRetry = (actions, n) => propose(actions).catch(function(error) {
    if (n === 1) throw error;
    return proposeRetry(actions, n - 1);
});

const propose = async (actions) => {
    const serialized_actions = await api.serializeActions(actions)
    const proposeInput = {
        proposer,
        proposal_name: proposalName,
        requested: dappGovOwner,
        trx: {
            expiration,
            ref_block_num: 22480,
            ref_block_prefix: 3659047377,
            max_net_usage_words: 0,
            max_cpu_usage_ms: 0,
            delay_sec: 0,
            context_free_actions: [],
            actions: serialized_actions,
            transaction_extensions: []
        }
    };

    //PROPOSE THE TRANSACTION
    await api.transact(
        {
            actions: [
                {
                    account: 'eosio.msig',
                    name: 'propose',
                    authorization: [{
                        actor: proposer,
                        permission: proposerPermissionLevel,
                    }],
                    data: proposeInput,
                }
            ]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
            broadcast: true,
            sign: true
        }
    );
}

const retries = 10;
(async () => {
    try {
        await propose(actions);
    } catch(e) {
        console.log(e);
        await proposeRetry(actions, retries);
    }
})();