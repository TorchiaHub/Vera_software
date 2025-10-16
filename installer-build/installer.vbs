Option Explicit

Dim fso, shell, tempDir, extractDir, appDir
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

' Definisci le directory
tempDir = shell.ExpandEnvironmentStrings("%TEMP%")
extractDir = tempDir & "\VERA_Installer_Temp"
appDir = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\VERA Environmental Awareness"

' Mostra messaggio di benvenuto
MsgBox "Benvenuto nell'installer di VERA Environmental Awareness v2.0.0" & vbCrLf & vbCrLf & _
       "Questo installer installer?? l'applicazione in:" & vbCrLf & appDir, vbInformation, "VERA Installer"

' Chiedi conferma
If MsgBox("Continuare con l'installazione?", vbYesNo + vbQuestion, "VERA Installer") = vbNo Then
    WScript.Quit
End If

' Crea directory temporanea
If fso.FolderExists(extractDir) Then
    fso.DeleteFolder extractDir, True
End If
fso.CreateFolder extractDir

' Estrai i file (questo sar?? gestito dal wrapper)
MsgBox "Estrazione dei file in corso...", vbInformation, "VERA Installer"

' Crea directory di installazione
If Not fso.FolderExists(appDir) Then
    fso.CreateFolder appDir
End If

' Copia i file
shell.Run "xcopy /s /e /y """ & extractDir & "\*"" """ & appDir & "\""", 0, True

' Crea collegamenti
Dim desktop, startMenu, shortcut
desktop = shell.SpecialFolders("Desktop")
startMenu = shell.SpecialFolders("StartMenu") & "\Programs"

' Collegamento Desktop
Set shortcut = shell.CreateShortcut(desktop & "\VERA Environmental Awareness.lnk")
shortcut.TargetPath = appDir & "\start-vera.bat"
shortcut.WorkingDirectory = appDir
shortcut.Description = "VERA Environmental Awareness Application"
shortcut.Save

' Collegamento Menu Start
Set shortcut = shell.CreateShortcut(startMenu & "\VERA Environmental Awareness.lnk")
shortcut.TargetPath = appDir & "\start-vera.bat"
shortcut.WorkingDirectory = appDir
shortcut.Description = "VERA Environmental Awareness Application"
shortcut.Save

' Pulisci file temporanei
fso.DeleteFolder extractDir, True

' Messaggio finale
If MsgBox("Installazione completata con successo!" & vbCrLf & vbCrLf & _
          "Vuoi avviare VERA Environmental Awareness ora?", vbYesNo + vbQuestion, "VERA Installer") = vbYes Then
    shell.Run """" & appDir & "\start-vera.bat""", 1, False
End If
