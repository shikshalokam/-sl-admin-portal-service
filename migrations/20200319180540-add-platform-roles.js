module.exports = {
  async up(db) {
    global.migrationMsg = "add platform roles"


    let rolesObj = {
      "roles": [
        {
          "actionGroups": [
            { "name": "Course Mentor", "id": "COURSE_MENTOR", "actions": [] }
          ], "name": "Course Mentor", "id": "COURSE_MENTOR"
        }
        ,
        {
          "actionGroups": [
            { "name": "Content Creation", "id": "CONTENT_CREATION", "actions": [] },
            { "name": "Content Curation", "id": "CONTENT_CURATION", "actions": [] },
            { "name": "Content Review", "id": "CONTENT_REVIEW", "actions": [] }
          ],
          "name": "Content Reviewer", "id": "CONTENT_REVIEWER"
        },
        {
          "actionGroups": [
            { "name": "System Administration", "id": "SYSTEM_ADMINISTRATION", "actions": [] },
            { "name": "Org Management", "id": "ORG_MANAGEMENT", "actions": [] }
          ],
          "name": "Admin", "id": "ADMIN"
        },
        {
          "actionGroups": [
            { "name": "Teacher Badge Issuer", "id": "TEACHER_BADGE_ISSUER", "actions": [] }
          ],
          "name": "Teacher Badge Issuer", "id": "TEACHER_BADGE_ISSUER"
        },
        {
          "actionGroups": [
            { "name": "Org Management", "id": "ORG_MANAGEMENT", "actions": [] },
            { "name": "Membership Management", "id": "MEMBERSHIP_MANAGEMENT", "actions": [] }
          ],
          "name": "Org Admin", "id": "ORG_ADMIN"
        }, {
          "actionGroups": [
            { "name": "Book Creator", "id": "BOOK_CREATOR", "actions": [] }
          ],
          "name": "Book Creator", "id": "BOOK_CREATOR"
        },
        {
          "actionGroups": [
            { "name": "Book Reviewer", "id": "BOOK_REVIEWER", "actions": [] }
          ],
          "name": "Book Reviewer", "id": "BOOK_REVIEWER"
        },
        {
          "actionGroups": [
            { "name": "Official TextBook Badge Issuer", "id": "OFFICIAL_TEXTBOOK_BADGE_ISSUER", "actions": [] }
          ],
          "name": "Official TextBook Badge Issuer", "id": "OFFICIAL_TEXTBOOK_BADGE_ISSUER"
        },
        {
          "actionGroups": [
            {
              "name": "Course Creator", "id": "COURSE_CREATOR", "actions": []
            }], "name": "Course Creator", "id": "COURSE_CREATOR"
        }, { "actionGroups": [{ "name": "Course Admin", "id": "COURSE_ADMIN", "actions": [] }], "name": "Course Admin", "id": "COURSE_ADMIN" }, { "actionGroups": [{ "name": "Membership Management", "id": "MEMBERSHIP_MANAGEMENT", "actions": [] }], "name": "Org Moderator", "id": "ORG_MODERATOR" }, { "actionGroups": [{ "name": "Public", "id": "PUBLIC", "actions": [] }], "name": "Public", "id": "PUBLIC" }, { "actionGroups": [{ "name": "Announcement Sender", "id": "ANNOUNCEMENT_SENDER", "actions": [] }], "name": "Announcement Sender", "id": "ANNOUNCEMENT_SENDER" }, { "actionGroups": [{ "name": "Program Manager", "id": "PROGRAM_MANAGER", "actions": [] }], "name": "Program Manager", "id": "PROGRAM_MANAGER" }, { "actionGroups": [{ "name": "Assessor", "id": "ASSESSOR", "actions": [] }], "name": "Assessor", "id": "ASSESSOR" }, { "actionGroups": [{ "name": "Content Creation", "id": "CONTENT_CREATION", "actions": [] }], "name": "Content Creator", "id": "CONTENT_CREATOR" }, { "actionGroups": [{ "name": "Project Manager", "id": "PROJECT_MANAGER", "actions": [] }], "name": "Project Manager", "id": "PROJECT_MANAGER" },
        { "actionGroups": [{ "name": "Lead Assessor", "id": "LEAD_ASSESSOR", "actions": [] }], "name": "Lead Assessor", "id": "LEAD_ASSESSOR" },
        {
          "actionGroups": [
            { "name": "Flag Reviewer", "id": "FLAG_REVIEWER", "actions": [] }], "name": "Flag Reviewer", "id": "FLAG_REVIEWER"
        }, {
          "name": "Platform Admin", "id": "PLATFORM_ADMIN"
        }
      ]
    }


    let platFormRoles = [];
    await Promise.all(rolesObj.roles.map(async function (roleInfo) {


      let role = {
        "createdAt": new Date,
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "status": "active",
        "isDeleted": false,
      }
      role["code"] = roleInfo.id;
      role["title"] = roleInfo.name;

      if (roleInfo.id == "LEAD_ASSESSOR" || roleInfo.id == "ASSESSOR" || roleInfo.id == "PROGRAM_MANAGER") {
        
        role["platformRole"] = false;
        role["programRole"] = true;
        role["customRole"] = true;
        
      }else if (roleInfo.id == "PLATFORM_ADMIN") {
        role["platformRole"] = false;
        role["programRole"] = false;
        role["customRole"] = true;
        
      } else {
        role["platformRole"] =  true;
        role["programRole"] = false;
        role["customRole"] = false;
      } 
      platFormRoles.push(role);

    }));

    // let dbRoles = await db.collection("platformRolesExt").insertMany(platFormRoles);
    db.collection('users').createIndex({ platformRole: 1 });

    let updateUserRoles = ["OBS_REVIEWER", "OBS_DESIGNER"];

    await Promise.all(updateUserRoles.map(async function (userRole) {
     let role  = {
        "platformRole": false,
        "programRole": false,
        "customRole": true
      }

      let roles = db.collection("platformRolesExt").findOneAndUpdate({ code: userRole }, {
        $set: {
          "platformRole": false,
          "programRole": false,
          "customRole": true
        }
      });
    }));

    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
