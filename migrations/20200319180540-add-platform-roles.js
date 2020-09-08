module.exports = {
  async up(db) {
    global.migrationMsg = "add platform roles"

    let roles = [
      {
        "name": "Platform Admin",
        "id": "PLATFORM_ADMIN"
      }, {
        "name": "Observation Reviewer",
        "id": "OBS_REVIEWER",

      }, {
        "name": "Observation Designer",
        "id": "OBS_DESIGNER"
      }
    ]

    let result = {
      "createdAt": new Date,
      "createdBy": "SYSTEM",
      "updatedBy": "SYSTEM",
      "status": "active",
      "isDeleted": false,
      "platformRole": false,
      "programRole": false,
      "customRole": false
    }

    let platFormRoles = [];

    await Promise.all(roles.map(async function (role) {

      let platformRoleObj = { ...result };

      platformRoleObj["code"] = role.id;
      platformRoleObj["title"] = role.name;

      if (
        role.id == "LEAD_ASSESSOR" ||
        role.id == "ASSESSOR" ||
        role.id == "PROGRAM_MANAGER"
      ) {
        platformRoleObj["programRole"] = true;
        platformRoleObj["customRole"] = true;

      } else if (role.id == "PLATFORM_ADMIN") {
        platformRoleObj["customRole"] = true;
        platformRoleObj['isHidden'] = true;

      } else {
        platformRoleObj["platformRole"] = true;
        platformRoleObj['isHidden'] = false;
      }
      platFormRoles.push(platformRoleObj);

    }));

    await db.collection("platformRolesExt").insertMany(platFormRoles);
    db.collection('users').createIndex({ platformRole: 1 });

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
