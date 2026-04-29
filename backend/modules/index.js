import { Router } from "express";
import authModule from "./auth/index.js";
import learningModule from "./learning/index.js";
import intelligenceModule from "./intelligence/index.js";
import engagementModule from "./engagement/index.js";
import opsModule from "./ops/index.js";

const apiModules = Router();

apiModules.use(authModule);
apiModules.use(learningModule);
apiModules.use(intelligenceModule);
apiModules.use(engagementModule);
apiModules.use(opsModule);

export default apiModules;
