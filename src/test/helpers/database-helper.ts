import { Db } from "@/db/client";


// should be implemented in BeforeEach hook
export const cleanupDatabase = async (db: Db) => {
  const deleteWorkflowDefinition = db.workflowDefinition.deleteMany();
  const deleteWorkflowRuntimeData = db.workflowRuntimeData.deleteMany();
  const deletePolicy = db.policy.deleteMany();
  const deleteFilter = db.filter.deleteMany();
  const deleteUser = db.user.deleteMany();
  const deleteEndUser = db.endUser.deleteMany();
  const deleteBusiness = db.business.deleteMany();
  const deleteEndUsersOnBusinesses = db.endUsersOnBusinesses.deleteMany();
  const deleteEntities = db.entities.deleteMany();
  const deleteFile = db.file.deleteMany();

  await db.$transaction([
    deleteWorkflowRuntimeData,
    deleteWorkflowDefinition,
    deleteEndUsersOnBusinesses,
    deleteEntities,
    deleteUser,
    deleteEndUser,
    deleteBusiness,
    deleteFile,
    deletePolicy,
    deleteFilter,
  ]);
};

// should be implemented in AfterEach hook
export const tearDownDatabase = async (db: Db) => {
  await db.$disconnect();
};
