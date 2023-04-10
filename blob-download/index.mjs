import { app } from "@azure/functions";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

const getBlobData = async function(blobName) {
    try {
        const containerName = process.env.AZURE_CONTAINER_NAME;
        const accountName = process.env.AZURE_ACCOUNT_NAME;
        const accountKey = process.env.AZURE_ACCOUNT_KEY;
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

        const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);
        const response = await blobClient.download();
        const data = (await streamToBuffer(response.readableStreamBody)).toString();
        return data;
    } catch (error) {
        console.log(error);
    }
}

const streamToBuffer = async function(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

const downloadBlob = async function (req, context) {
    const blobName = req.query.get("name");
    if (!blobName) {
        return {
            status: 400,
            body: "Filename not provided :-("
        }
    }
    const blob = await getBlobData(blobName);
    if (blob === undefined) {
        return {
            status: 404,
            body: "File not found :-("
        }
    }
    context.log(`Now downloading ${blobName} ...`)
    return {
        headers: {
            'Content-Type': "application/octet-stream",
            'Content-Disposition': `attachment; filename="${blobName}"`
        },
        status: 200, /* Defaults to 200 */
        body: blob
    };
}

app.http('blob-download', {
    methods: ['GET', 'POST'],
    handler: downloadBlob
});
