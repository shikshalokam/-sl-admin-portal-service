module.exports = {
  async up(db) {
    global.migrationMsg = "add platform roles"

    let roles = [
        {
          "name": "Course Mentor", 
          "id": "COURSE_MENTOR"
        },
        {
          "name": "Content Reviewer", 
          "id": "CONTENT_REVIEWER"
        },
        {
          "name": "Admin", 
          "id": "ADMIN"
        },
        {
          "name": "Teacher Badge Issuer", 
          "id": "TEACHER_BADGE_ISSUER"
        },
        {
          "name": "Org Admin", 
          "id": "ORG_ADMIN"
        }, {
          "name": "Book Creator", 
          "id": "BOOK_CREATOR"
        },
        {
          "name": "Book Reviewer", 
          "id": "BOOK_REVIEWER"
        },
        {
          "name": "Official TextBook Badge Issuer", 
          "id": "OFFICIAL_TEXTBOOK_BADGE_ISSUER"
        },
        {
           "name": "Course Creator", 
           "id": "COURSE_CREATOR"
        }, {
           "name": "Course Admin", 
           "id": "COURSE_ADMIN" 
        }, { 
           "name": "Org Moderator", 
           "id": "ORG_MODERATOR" 
        }, { 
           "name": "Public", 
           "id": "PUBLIC" 
        }, { 
          "name": "Announcement Sender", 
          "id": "ANNOUNCEMENT_SENDER" 
        }, {  
          "name": "Program Manager", 
          "id": "PROGRAM_MANAGER" 
        }, { 
          "name": "Assessor", 
          "id": "ASSESSOR" 
        }, {  
          "name": "Content Creator", 
          "id": "CONTENT_CREATOR" 
        }, {  
          "name": "Project Manager", 
          "id": "PROJECT_MANAGER" 
        },{ 
          "name": "Lead Assessor", 
          "id": "LEAD_ASSESSOR" 
        },{
          "name": "Flag Reviewer", 
          "id": "FLAG_REVIEWER"
        }, {
          "name": "Platform Admin", 
          "id": "PLATFORM_ADMIN"
        }
      ]

    
    let result = {
      "createdAt" : new Date,
      "createdBy" : "SYSTEM",
      "updatedBy" : "SYSTEM",
      "status" : "active",
      "isDeleted": false,
      "platformRole" : false,
      "programRole" : false,
      "customRole" : false 
    }  

    let platFormRoles = [];

    await Promise.all(roles.map(async function (role) {

      let platformRoleObj = {...result};

      platformRoleObj["code"] = role.id;
      platformRoleObj["title"] = role.name;

      if ( 
        role.id == "LEAD_ASSESSOR" || 
        role.id == "ASSESSOR" || 
        role.id == "PROGRAM_MANAGER" 
      ) {
        platformRoleObj["programRole"] = true;
        platformRoleObj["customRole"] = true;
        
      } else if ( role.id == "PLATFORM_ADMIN" ) {
        platformRoleObj["customRole"] = true;
        
      } else {
        platformRoleObj["platformRole"] =  true;
      } 
      platFormRoles.push(platformRoleObj);

    }));

    await db.collection("platformRolesExt").insertMany(platFormRoles);
    db.collection('users').createIndex({ platformRole: 1 });

    let updateUserRoles = [ "OBS_REVIEWER", "OBS_DESIGNER" ];

    await Promise.all(updateUserRoles.map(async function (userRole) {

      db.collection("platformRolesExt").findOneAndUpdate({ code: userRole }, {
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
