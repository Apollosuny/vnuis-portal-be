import { HttpStatus } from '@nestjs/common'
import { FileModule } from '../file.module'
import { TestContext, testHelper } from '@app/spec'

describe('FileService', () => {
  jest.setTimeout(30000)

  let tc: TestContext

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [FileModule],
    })
  })

  afterAll(async () => {
    await tc.clean()
  })

  it('Validate DTO', async () => {
    // await tc
    //   .requestJwt((t) => t.post('/storage/genS3Upload'))
    //   .send({ key: 'xxx' })
    //   .expect(HttpStatus.BAD_REQUEST);
  })
})
