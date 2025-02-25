/**
 * This is a custom nanoid generator.
 * It uses a Base58 alphabet, so the IDs look better
 */
import { customAlphabet } from "nanoid";

const prettyID = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
);

export default prettyID;
