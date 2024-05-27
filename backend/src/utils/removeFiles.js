import fs from "fs";

async function removeFiles(localFilePath) {
    await fs.unlinkSync(localFilePath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        // File deleted successfully! Send a response
        console.log("File uploaded and deleted successfully");
    });
}

export { removeFiles};
