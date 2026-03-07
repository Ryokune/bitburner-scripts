{
  description = "Remote Bitburner TypeScript";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs =
    inputs@{ self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          git
          nodejs
        ];
        # Define environment variables or hooks
        shellHook = ''
          cd bitremote
          npm start
        '';
      };
    };
}
