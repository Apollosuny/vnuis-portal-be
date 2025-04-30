import { SetMetadata } from '@nestjs/common'

export const EXCLUDE_OPERATOR_KEY = 'EXCLUDE_OPERATOR_KEY'
export const ExcludeConfirm = () => SetMetadata(EXCLUDE_OPERATOR_KEY, true)
