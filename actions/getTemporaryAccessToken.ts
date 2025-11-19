'use server'

import { currentUser } from "@clerk/nextjs/server"
import { SchematicClient } from "@schematichq/schematic-typescript-node";

const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });

export async function getTemporaryAccessToken() {
    console.log("Getting temporary access token");
    const user = await currentUser();

    if(!user){
        console.log("No user found, returning null");
        return null;
    }
    console.log(`Issuing temporary access token for  user: ${user.id}`);
    const resp = await client.accesstokens.issueTemporaryAccessToken({
        resource_type: "company",
        lookup: { id: user.id }, // The lookup will vary depending on how you have configured your company keys
      });
     console.log("Token response received", resp.data ?  "Token received" : "No token response",  
     );
     return resp.data?.token; 
}