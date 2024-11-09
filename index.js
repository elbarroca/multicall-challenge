// index.js
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
require('dotenv').config();

// Helper function to add a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // Connect to the Westend testnet
    const provider = new WsProvider('wss://westend-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider });

    console.log(`Connected to ${await api.rpc.system.chain()}`);

    // Initialize keyring with the test account
    const keyring = new Keyring({ type: 'sr25519' });
    const user = keyring.addFromUri(process.env.PRIVATE_KEY);

    try {
        // Log available modules
        console.log("Available modules:", Object.keys(api.query));

        // Generate block number and a dummy token ID for testing
        const blockNumber = (await api.rpc.chain.getHeader()).number.toHuman();
        const nextTokenId = Math.floor(Math.random() * 10000);
        
        // Format remarks as specified
        const remarkContent1 = `blockNumber/${blockNumber}-${nextTokenId}`;
        const remarkContent2 = `task_multicall/${user.address}`;

        // Log the remarks
        console.log(`Creating remarks: ${remarkContent1} and ${remarkContent2}`);

        // Create and submit the first remark transaction
        const tx1 = api.tx.system.remark(remarkContent1);
        const unsub1 = await tx1.signAndSend(user, ({ status }) => {
            if (status.isInBlock) {
                const blockHash = status.asInBlock.toHex();
                console.log(`Transaction 1 included at blockHash ${blockHash}`);
                console.log(`View Transaction 1 on Subscan: https://westend.subscan.io/block/${blockHash}`);
                unsub1();
            } else {
                console.log(`Current status for remark 1: ${status}`);
            }
        });

        // Delay for 3 seconds before submitting the second transaction
        await delay(3000);

        // Create and submit the second remark transaction
        const tx2 = api.tx.system.remark(remarkContent2);
        const unsub2 = await tx2.signAndSend(user, ({ status }) => {
            if (status.isInBlock) {
                const blockHash = status.asInBlock.toHex();
                console.log(`Transaction 2 included at blockHash ${blockHash}`);
                console.log(`View Transaction 2 on Subscan: https://westend.subscan.io/block/${blockHash}`);
                unsub2();
            } else {
                console.log(`Current status for remark 2: ${status}`);
            }
        });
    } catch (error) {
        console.error("Error querying data or creating transaction:", error);
    } finally {
        await api.disconnect();
    }
}

main().catch(console.error);
