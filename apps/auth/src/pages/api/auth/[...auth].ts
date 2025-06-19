import { auth } from "@crebost/shared"
import { toNextJsHandler } from "better-auth/next-js"

export default toNextJsHandler(auth)
