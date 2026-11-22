!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\*\shell\bzUnlocker"
  DeleteRegKey HKCU "Software\Classes\Directory\shell\bzUnlocker"
!macroend
