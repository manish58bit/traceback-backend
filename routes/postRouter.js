const express = require("express");
const {
  allPost_lostItems,
  post_lostItem,
} = require("../controllers/lostItemController.js");
const {
  allPost_foundItems,
  post_foundItem,
} = require("../controllers/foundItemController.js");
const router = express.Router();

router.route("/lostItem").get(allPost_lostItems);
router.route("/lostItem").post(post_lostItem);
router
  .route("/lostItem/mine")
  .get(
    require("../controllers/lostItemController.js").allPost_lostItems_byUser
  );
router
  .route("/lostItem/:id")
  .put(require("../controllers/lostItemController.js").update_lostItem_byId)
  .delete(require("../controllers/lostItemController.js").delete_lostItem_byId);
router.route("/foundItem").get(allPost_foundItems);
router.route("/foundItem").post(post_foundItem);
router
  .route("/foundItem/mine")
  .get(
    require("../controllers/foundItemController.js").allPost_foundItems_byUser
  );
router
  .route("/foundItem/:id")
  .put(require("../controllers/foundItemController.js").update_foundItem_byId)
  .delete(
    require("../controllers/foundItemController.js").delete_foundItem_byId
  );

module.exports = router;
