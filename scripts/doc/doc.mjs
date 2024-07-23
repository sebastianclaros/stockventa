// Comandos validos
import {execute} from "../automation/helpers/metadata.mjs";

try {
  execute(process.argv.slice(2));
} catch (e) {
  console.error(e);
}
