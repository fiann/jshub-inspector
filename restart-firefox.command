# Restart Firefox so that we can see updates to the extension
osascript -e 'tell application "Firefox" 
quit 
delay 2
end tell'
/Applications/Firefox.app/Contents/MacOS/firefox-bin -chromebug -no-remote -P 'Plugin Test' &