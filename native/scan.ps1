param([Parameter(Mandatory=$true)][string]$Target)
$ErrorActionPreference = 'Stop'
try {
  $code = @'
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
public static class RestartManagerScan {
  const int CCH_RM_MAX_APP_NAME = 255;
  const int CCH_RM_MAX_SVC_NAME = 63;
  [StructLayout(LayoutKind.Sequential)] public struct RM_UNIQUE_PROCESS { public int dwProcessId; public System.Runtime.InteropServices.ComTypes.FILETIME ProcessStartTime; }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] public struct RM_PROCESS_INFO {
    public RM_UNIQUE_PROCESS Process;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=CCH_RM_MAX_APP_NAME+1)] public string strAppName;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=CCH_RM_MAX_SVC_NAME+1)] public string strServiceShortName;
    public uint ApplicationType; public uint AppStatus; public uint TSSessionId;
    [MarshalAs(UnmanagedType.Bool)] public bool bRestartable;
  }
  [DllImport("rstrtmgr.dll", CharSet=CharSet.Unicode)] static extern int RmStartSession(out uint handle, int flags, string key);
  [DllImport("rstrtmgr.dll", CharSet=CharSet.Unicode)] static extern int RmRegisterResources(uint handle, uint nFiles, string[] files, uint nApplications, IntPtr apps, uint nServices, string[] services);
  [DllImport("rstrtmgr.dll")] static extern int RmGetList(uint handle, out uint needed, ref uint count, [In, Out] RM_PROCESS_INFO[] processes, ref uint rebootReasons);
  [DllImport("rstrtmgr.dll")] static extern int RmEndSession(uint handle);
  public static int[] GetPids(string[] files) {
    uint handle; int status = RmStartSession(out handle, 0, Guid.NewGuid().ToString("N"));
    if (status != 0) throw new Exception("RmStartSession: " + status);
    try {
      status = RmRegisterResources(handle, (uint)files.Length, files, 0, IntPtr.Zero, 0, null);
      if (status != 0) throw new Exception("RmRegisterResources: " + status);
      uint needed=0, count=0, reasons=0;
      status = RmGetList(handle, out needed, ref count, null, ref reasons);
      if (status == 0) return new int[0];
      if (status != 234) throw new Exception("RmGetList: " + status);
      RM_PROCESS_INFO[] info = new RM_PROCESS_INFO[needed]; count=needed;
      status = RmGetList(handle, out needed, ref count, info, ref reasons);
      if (status != 0) throw new Exception("RmGetList: " + status);
      HashSet<int> pids = new HashSet<int>();
      for (int i=0; i<count; i++) pids.Add(info[i].Process.dwProcessId);
      int[] result = new int[pids.Count]; pids.CopyTo(result); return result;
    } finally { RmEndSession(handle); }
  }
}
'@
  Add-Type -TypeDefinition $code -ErrorAction Stop
  $item = Get-Item -LiteralPath $Target -Force
  $files = New-Object 'System.Collections.Generic.List[string]'
  $enumerationErrors = @()
  if ($item.PSIsContainer) {
    # Restart Manager accepts file paths only. Passing a directory makes
    # RmGetList return ERROR_ACCESS_DENIED (5).
    Get-ChildItem -LiteralPath $Target -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable +enumerationErrors | ForEach-Object {
      if (-not $_.PSIsContainer -and $files.Count -lt 1000) { $files.Add($_.FullName) }
    }
  } else { $files.Add($item.FullName) }
  $unique = @{}
  for ($chunkStart = 0; $chunkStart -lt [int][Math]::Ceiling($files.Count / 100.0); $chunkStart++) {
    $chunk = $files.GetRange($chunkStart*100, [Math]::Min(100, $files.Count-$chunkStart*100)).ToArray()
    foreach ($pidValue in [RestartManagerScan]::GetPids($chunk)) {
      if ($pidValue -gt 0) { $unique[[string]$pidValue] = $true }
    }
  }
  $processes = @()
  foreach ($id in $unique.Keys) {
    try {
      $p = [System.Diagnostics.Process]::GetProcessById([int]$id)
      $exe = ''
      try { $exe = $p.MainModule.FileName } catch {}
      $processes += @{ pid = [int]$id; name = $p.ProcessName + '.exe'; exe = $exe }
    } catch {}
  }
  @{ processes = @($processes); scanned = $files.Count; truncated = ($item.PSIsContainer -and $files.Count -ge 1000); skipped = ($enumerationErrors.Count -gt 0) } | ConvertTo-Json -Depth 4 -Compress
} catch {
  $exception = $_.Exception
  while ($exception.InnerException) { $exception = $exception.InnerException }
  $errorMessage = $exception.Message
  $errorCode = 'scan_failed'
  $systemCode = $null
  $operation = $null
  if ($errorMessage -match '^Rm(GetList|RegisterResources|StartSession):\s*(\d+)$') {
    $operation = $Matches[1]
    $systemCode = [int]$Matches[2]
    switch ($systemCode) {
      5 { $errorCode = 'rm_directory' }
      14 { $errorCode = 'rm_out_of_memory' }
      29 { $errorCode = 'rm_write_fault' }
      121 { $errorCode = 'rm_timeout' }
      1223 { $errorCode = 'rm_cancelled' }
      default { $errorCode = 'rm_failed' }
    }
  } elseif ($exception -is [System.UnauthorizedAccessException]) {
    $errorCode = 'access_denied'
  }
  @{ errorCode = $errorCode; systemCode = $systemCode; operation = $operation } | ConvertTo-Json -Compress
}
