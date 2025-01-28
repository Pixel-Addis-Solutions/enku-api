import fs from 'fs';
import util from 'util';

const unlink = util.promisify(fs.unlink);

export const unlinkFile = async (filePath: string) => {
    try {
        await unlink(filePath);
        console.log(`File deleted: ${filePath}`);
    } catch (error) {
        console.error(`Error deleting file: ${filePath}`, error);
    }
};