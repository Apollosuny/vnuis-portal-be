import { SetMetadata } from '@nestjs/common'

export const EXCLUDE_STUDENT_KEY = 'EXCLUDE_STUDENT_KEY'
export const ExcludeConfirm = () => SetMetadata(EXCLUDE_STUDENT_KEY, true)
