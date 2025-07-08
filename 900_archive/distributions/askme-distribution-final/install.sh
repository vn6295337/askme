#!/bin/bash

# Simple installer for askme CLI

INSTALL_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/askme"

echo "Installing askme CLI..."

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$APP_DIR"

# Copy application files
echo "Copying application files..."
cp -r ./app/* "$APP_DIR/"

# Create a runnable script
echo "Creating command..."
cat > "$INSTALL_DIR/askme" << EOL
#!/bin/bash
"$HOME/.local/share/askme/bin/cliApp" "$@"
EOL

# Make it executable
chmod +x "$INSTALL_DIR/askme"

echo ""
echo "Installation complete!"
echo ""
echo "To use, open a new terminal and type:"
echo "  askme \"Your question here\""
echo ""
echo "Or, for interactive mode, just type:"
echo "  askme"
echo ""
echo "You may need to add $HOME/.local/bin to your PATH."
echo "If the 'askme' command is not found, add the following to your ~/.bashrc or ~/.zshrc:"
echo '  export PATH="$HOME/.local/bin:$PATH"'
echo "Then, restart your terminal."