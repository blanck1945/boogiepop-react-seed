import { Route, Routes } from 'react-router-dom'
import { PlatformMap } from '../pages/PlatformMap'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<PlatformMap />} />
    </Routes>
  )
}
