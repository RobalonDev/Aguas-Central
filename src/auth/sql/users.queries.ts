/** Types generated for queries found in "src/auth/sql/users.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateUser' parameters type */
export interface ICreateUserParams {
  displayName: string;
  email: string;
}

/** 'CreateUser' return type */
export interface ICreateUserResult {
  display_name: string;
  email: string;
  id: string;
}

/** 'CreateUser' query type */
export interface ICreateUserQuery {
  params: ICreateUserParams;
  result: ICreateUserResult;
}

const createUserIR: any = {
  usedParamSet: { email: true, displayName: true },
  params: [
    {
      name: 'email',
      required: true,
      transform: { type: 'scalar' },
      locs: [{ a: 52, b: 58 }],
    },
    {
      name: 'displayName',
      required: true,
      transform: { type: 'scalar' },
      locs: [{ a: 61, b: 73 }],
    },
  ],
  statement:
    'INSERT INTO app.users (email, display_name)\nVALUES (:email!, :displayName!)\nRETURNING id, email, display_name',
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO app.users (email, display_name)
 * VALUES (:email!, :displayName!)
 * RETURNING id, email, display_name
 * ```
 */
export const createUser = new PreparedQuery<
  ICreateUserParams,
  ICreateUserResult
>(createUserIR);

/** 'CreatePasswordCredential' parameters type */
export interface ICreatePasswordCredentialParams {
  passwordHash: string;
  userId: string;
}

/** 'CreatePasswordCredential' return type */
export type ICreatePasswordCredentialResult = void;

/** 'CreatePasswordCredential' query type */
export interface ICreatePasswordCredentialQuery {
  params: ICreatePasswordCredentialParams;
  result: ICreatePasswordCredentialResult;
}

const createPasswordCredentialIR: any = {
  usedParamSet: { userId: true, passwordHash: true },
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      locs: [{ a: 70, b: 77 }],
    },
    {
      name: 'passwordHash',
      required: true,
      transform: { type: 'scalar' },
      locs: [{ a: 80, b: 93 }],
    },
  ],
  statement:
    'INSERT INTO app.password_credentials (user_id, password_hash)\nVALUES (:userId!, :passwordHash!)',
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO app.password_credentials (user_id, password_hash)
 * VALUES (:userId!, :passwordHash!)
 * ```
 */
export const createPasswordCredential = new PreparedQuery<
  ICreatePasswordCredentialParams,
  ICreatePasswordCredentialResult
>(createPasswordCredentialIR);
