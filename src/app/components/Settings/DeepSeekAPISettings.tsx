import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Blockquote from './Blockquote'
import { DeepSeekAPIModel } from '~services/user-config'
import { UserConfig } from '~services/user-config'
import { Input } from '../Input'
import Select from '../Select'

interface Props {
  userConfig: UserConfig
  updateConfigValue: (update: Partial<UserConfig>) => void
}

const DEEPSEEK_MODEL_OPTIONS = [
  { name: 'deepseek-chat', value: DeepSeekAPIModel['deepseek-chat'] },
  { name: 'deepseek-reasoner', value: DeepSeekAPIModel['deepseek-reasoner'] },
]

const DeepSeekAPISettings: FC<Props> = ({ userConfig, updateConfigValue }) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">
          API Key (
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            how to create key
          </a>
          )
        </p>
        <Input
          className="w-[400px]"
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={userConfig.deepseekApiKey}
          onChange={(e) => updateConfigValue({ deepseekApiKey: e.currentTarget.value })}
          type="password"
        />
        <Blockquote className="mt-1">{t('Your keys are stored locally')}</Blockquote>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">Model</p>
        <div className="w-[200px]">
          <Select
            options={DEEPSEEK_MODEL_OPTIONS}
            value={userConfig.deepseekApiModel}
            onChange={(v) => updateConfigValue({ deepseekApiModel: v })}
          />
        </div>
      </div>
    </div>
  )
}

export default DeepSeekAPISettings