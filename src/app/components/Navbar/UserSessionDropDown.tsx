'use client'
import Dropdown from '@/app/components/Dropdown'
import {
  ChartPieIcon,
  RectangleStackIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline'

export default function UserSessionDropDown() {
return <Dropdown button={{icon: <BellIcon className='h-6 w-6 mr-6' />}} popupOptions={[
            { name: 'Review', description: 'Review the subscribed memory pieces', href: '/review', icon: RectangleStackIcon },
            { name: 'Practice', description: 'Today\'s practice task', href: '/practice', icon: ClockIcon }, 
            { name: 'Performance', description: 'Performance dashboard', href: '/performance', icon: ChartPieIcon }]}/>
}