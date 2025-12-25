import { FC } from 'react'
import { useSession } from '../session/SessionContext'

const Sign: FC<{ text: string }> = ({ text }) => {
  const { session } = useSession();
  
  // 如果用户已登录，不显示Sign in按钮
  if (session) {
    return null;
  }

  return (
    <div className='rounded-[10px] w-full pl-3 flex flex-row gap-3 items-center shrink-0 py-[11px] justify-center'>

      {<span className="font-medium text-sm">{text}</span>}
    </div>
  )
}

export default Sign
