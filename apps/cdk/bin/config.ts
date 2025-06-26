export interface IConfig {
  env: 'dev' | 'prd'
  name: string
  ORIGINS: string[]
  SECRET_ARN: string
}
