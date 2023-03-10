const { log16 } = require("./utils/utils.js");

const crypto = require("crypto"), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");

class Block {
    constructor(timestamp = "", data = []) {
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.getHash(); //this makes it immutable. Contains hash of timestamp, previous data, etc..
        this.prevHash = ""; //hash of previous block
        this.nonce = 0;
    }

    getHash() {
        return SHA256(JSON.stringify(this.data)+this.timestamp+this.prevHash + this.nonce);
    }

    mine(difficulty) {
        //loop until the hash has "5+difficulty" starting zeros
        while(!this.hash.startsWith("00000" + Array(Math.floor(log16(difficulty)) + 1).join("0")))
        {
            this.nonce++;
            this.hash = this.getHash();
        }
    }

}

class Blockchain {
    constructor() {
        this.chain = [new Block(Date.now().toString())];
        this.difficulty = 1;
        this.blockTime = 30000;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block) {
        block.prevHash = this.getLastBlock().hash;
        block.hash = block.getHash();

        block.mine(this.difficulty);

        this.chain.push(block);
        

        // The difficulty will be incremented by 1 if block time is less than the actual time the block's mined,
        // it will be decremented otherwise.
        // this.difficulty += Date.now() - parseInt(this.getLastBlock().timestamp) < this.blockTime ? 1 : -1;
        //

        //new difficulty = old difficulty * (100 blocks * blockTime) / mining time for the previous 100 blocks
        this.difficulty = Math.ceil(this.difficulty * 100 * this.blockTime / (block.timestamp - this.getLastBlock().timestamp));
    }

    isValid(blockchain = this) {
        for (let i = 1; i < blockchain.chain.length; i++)
        {
            const currentBlock = blockchain.chain[i]; 
            const prevBlock = blockchain.chain[i-1];

            if ((currentBlock.hash !== currentBlock.getHash()) || (currentBlock.prevHash !== prevBlock.hash))
            {
                return false;
            }
        }

        return true;
    }

}

const VsChain = new Blockchain();
VsChain.addBlock(new Block(Date.now().toString(), ["Hello", "World"])); //genesis block
VsChain.addBlock(new Block(Date.now().toString(), ["Hello", "Wurld"])); //genesis block
VsChain.addBlock(new Block(Date.now().toString(), ["Hello", "Woorld"])); //genesis block
console.log(VsChain.chain);
console.log(VsChain.isValid());
//