module.exports = {
  async up(db) {
    global.migrationMsg = "Add role to platformRolesExt collection "

    let userId = process.env.PLATFORM_AND_ORG_ADMIN_ROLE_TO_USER;
    let staticRoles = [{ role: "PLATFORM_ADMIN", title: "Platform Admin" }, { role: "ORG_ADMIN", title: "Organisation Admin" }]

    let roles = [];

    await Promise.all(staticRoles.map(async function (rolesInfo) {

      let roleObj = {
        "createdAt": new Date,
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "status": "active",
        "isDeleted": false
      }
      roleObj["code"] = rolesInfo.role;
      roleObj["title"] = rolesInfo.title;
      roles.push(roleObj);

    }));
    let dbRoles = await db.collection("platformRolesExt").insertMany(roles);

    if (dbRoles && dbRoles.ops) {
      dbRoles.ops.forEach(element => {
        let roleObj = { roleId: element._id, code: element.code };
        db.collection("platformUserRolesExt").findOneAndUpdate({ userId: userId }, { $push: { roles: roleObj } })
      });

    }
    return true;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
