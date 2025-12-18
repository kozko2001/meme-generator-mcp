{
  description = "Meme Generator MCP Server";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
            nodePackages.pnpm
            nodePackages.typescript
            nodePackages.typescript-language-server
          ];

          shellHook = ''
            echo "🎭 Meme Generator MCP Development Environment"
            echo "Node version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"
            echo ""
            echo "Run 'pnpm install' to install dependencies"
          '';
        };
      }
    );
}
