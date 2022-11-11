declare module "*.vue" {
  import Vue from "vue"
  export default Vue
}

declare module "uview-ui" {
  export function install(): void
  interface $u {
    config: any
  }
  global {
    interface Uni {
      $u: $u
    }
  }
}
