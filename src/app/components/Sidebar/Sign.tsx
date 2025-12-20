import { FC } from 'react'

const Sign: FC<{ text: string }> = ({ text }) => {
  return (
    <div className='rounded-[10px] w-full pl-3 flex flex-row gap-3 items-center shrink-0 py-[11px] justify-center'>

      {<span className="font-medium text-sm">{text}</span>}
    </div>
  )
}

export default Sign
