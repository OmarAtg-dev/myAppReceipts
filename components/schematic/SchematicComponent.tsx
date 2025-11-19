// this is a server Component that fetches the access token which is secure 
// then rendering out a client component  'SchematicEmbed' , passing throught the access token and the componentId props ,
// then we render out the client component 
import { getTemporaryAccessToken } from "@/actions/getTemporaryAccessToken";
import SchematicEmbed from "./SchematicEmbed";

 
async function SchematicComponent({ componentId }: { componentId?: string }) {
    if(!componentId){
        return null;
    }
    const accessToken = await getTemporaryAccessToken();
    if(!accessToken){
        throw new Error("No access token found for users ");
        
    }
    return <SchematicEmbed accessToken={accessToken} componentId={componentId} />;

}

export default SchematicComponent 