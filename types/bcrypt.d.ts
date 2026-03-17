declare module "bcrypt" {
  function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  function genSalt(rounds?: number): Promise<string>;
  function hashSync(data: string | Buffer, saltOrRounds: string | number): string;
  function compareSync(data: string | Buffer, encrypted: string): boolean;
}
