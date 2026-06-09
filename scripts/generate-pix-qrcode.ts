import QRCode from "qrcode";

const pixConfig = {
  city: "JUIZ DE FORA",
  key: "2d8597cb-c2ba-41e5-9eb4-7221e7e1c4e8",
  name: "THALES CAMPELO DA CONCEICAO",
  output: "public/pix-qrcode.png",
  transactionId: "PETROAGENT",
};

function field(id: string, value: string) {
  const length = String(value.length).padStart(2, "0");

  return `${id}${length}${value}`;
}

function normalizePixText(value: string, maxLength: number) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9 .-]/g, "")
    .trim()
    .slice(0, maxLength);
}

function crc16Ccitt(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload() {
  const merchantAccountInfo = field(
    "26",
    field("00", "br.gov.bcb.pix") + field("01", pixConfig.key),
  );
  const additionalData = field(
    "62",
    field("05", normalizePixText(pixConfig.transactionId, 25)),
  );
  const payloadWithoutCrc = [
    field("00", "01"),
    field("01", "11"),
    merchantAccountInfo,
    field("52", "0000"),
    field("53", "986"),
    field("58", "BR"),
    field("59", normalizePixText(pixConfig.name, 25)),
    field("60", normalizePixText(pixConfig.city, 15)),
    additionalData,
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16Ccitt(payloadWithoutCrc)}`;
}

async function main() {
  const payload = buildPixPayload();

  console.log("PIX COPY AND PASTE:");
  console.log(payload);

  await QRCode.toFile(pixConfig.output, payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 600,
  });

  console.log(`QR Code generated at ${pixConfig.output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
