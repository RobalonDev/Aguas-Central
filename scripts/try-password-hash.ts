import * as argon2 from 'argon2';

async function main(): Promise<void> {
  const password = 'Una frase de prueba larga';
  const fakePassword = 'Una contraseña falsa';

  const firstHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  console.log(firstHash);

  // Completa aquí el ejercicio.
  const secondHash = await argon2.hash(password, { type: argon2.argon2id });
  console.log(secondHash);

  const result = firstHash === secondHash;
  console.log(result);

  const correctPassword = await argon2.verify(firstHash, password);
  console.log(correctPassword);

  const incorrectPassword = await argon2.verify(secondHash, fakePassword);
  console.log(incorrectPassword);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
