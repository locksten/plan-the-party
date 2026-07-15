{ lib, pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;

    pnpm = {
      enable = true;
      package = pkgs.pnpm;
    };

    corepack.enable = false;
  };

  # devenv's legacy enterShell task writes all task exports through the shared
  # .devenv/load-exports file. The v2 CLI transports exports directly from its
  # task runner, so the file is redundant and its non-atomic rewrite only adds
  # a race when multiple direnv activations run concurrently.
  tasks."devenv:enterShell".exec = lib.mkForce "true";
}
