# maiden app keybindings

## editor

maiden uses an embedded [monaco editor](https://microsoft.github.io/monaco-editor/)
and supports its default (VS Code–style) keybindings. a full list of default
shortcuts can be found in the [VS Code keyboard shortcuts
reference](https://code.visualstudio.com/docs/editor/codebasics#_keyboard-shortcuts).

a few useful ones include:

| mac | linux/win | action |
|:----|:-------------:| :------|
| ⌘ f | ctrl+f | find |
| ⌘ / | ctrl+/ | toggle comment |
| ⌘ d | ctrl+d | add selection to next find match |
| ⌘ shift d | ctrl+shift+d | (unbound by default; use ⌘⇧K / ctrl+shift+k to delete line) |
| tab | tab | indent |
| shift+tab | shift+tab | outdent |
| ctrl+space | ctrl+space | see code completions, snippets |

(note that these require the editor pane to have focus).

vim and emacs modes are also supported (enabled via the configuration page).

## maiden actions

in addition, some  common maiden actions also have shortcuts.  in particular:

| mac | linux/win | action |
|:----|:-------------:| :------|
| ⌘ b | ctrl+b | toggle the file viewer sidebar |
| ⌘ e | ctrl+e | toggle the repl view |
| ⌘ ; | ctrl+; | open the configuration page |
| ⌘ s | ctrl+s | save script |
| ⌘ p | ctrl+p | run script |
| ⌘ enter / ⌘ 8 | ctrl+enter / ctrl+8 | evaluate selection (or current line) |

with more to come!
