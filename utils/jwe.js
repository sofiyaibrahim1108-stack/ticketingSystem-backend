import { CompactEncrypt,compactDecrypt } from "jose";

const encoder = new TextEncoder()

if(!process.env.JWE_SECRET){
    throw new Error("JWE_SECRET is missing from.env")
}

const secretKey = encoder.encode(process.env.JWE_SECRET.trim());

if(secretKey.length !== 32){
    throw new Error(
      `JWE_SECRET must be 32 bytes, got ${secretKey.length}`  
    )
}

export async function createToken(payload){
    return await new CompactEncrypt(
        encoder.encode(JSON.stringify(payload))
    )
    .setProtectedHeader({alg: "dir" ,enc:"A256GCM"})
    .encrypt(secretKey)
}

export async function verifyToken(token){
    const {plaintext} = await compareDecrypt(token,secretKey)
      return JSON.parse(new TextDecoder().decode(plaintext));
}