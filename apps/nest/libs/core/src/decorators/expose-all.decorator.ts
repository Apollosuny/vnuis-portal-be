import { applyDecorators, UseInterceptors, SerializeOptions } from '@nestjs/common'
import { AppClassSerializerInterceptor } from '../interceptors/app-class-serializer.interceptor'

export function ExposeAll() {
  return applyDecorators(
    UseInterceptors(AppClassSerializerInterceptor),
    SerializeOptions({
      strategy: 'exposeAll',
      exposeUnsetFields: false,
    }),
  )
}
