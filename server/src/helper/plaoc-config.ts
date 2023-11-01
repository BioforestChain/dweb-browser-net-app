import { jsProcess } from '../../deps.ts'
import { $PlaocConfig } from './const.ts'

export class PlaocConfig {
  constructor(readonly config: $PlaocConfig) {}
  static async init() {
    try {
      const readPlaoc = await jsProcess.nativeRequest(
        `file:///usr/www/plaoc.json`,
      )
      return new PlaocConfig(JSON.parse(await readPlaoc.body.text()))
    } catch {
      return new PlaocConfig({ redirect: [], defaultConfig: { lang: 'en' } })
    }
  }
}
