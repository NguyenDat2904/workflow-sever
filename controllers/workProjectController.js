const modelWorkProject = require('../models/modelWorkProject');
const modelListWork = require('../models/modalListWorks');
const modalWorkDetail = require('../models/modelWorkDetail');
const dataImgProject = require('../imgProject.json');
const userModel = require('../models/modelUser');
const { transporter, checkEmail } = require('../helpers/email');
const jwt = require('jsonwebtoken');
const modelUser = require('../models/modelUser');
require('dotenv').config();

//lấy project
const getWorkProject = async (req, res) => {
    try {
        const { sortKey, deleteProject } = req.query;
        const { email } = req.user;
        const page = parseInt(req.query.page) || 1;
        const sortOrder = parseInt(req.query.sortOrder) || 1;
        const limit = parseInt(req.query.limit) || 25;
        if (!email || deleteProject === '') {
            return res.status(404).json({
                message: 'not found id or deleteProject',
            });
        }
        const totalUsers = await modelWorkProject.countDocuments();
        const totalPages = Math.ceil(totalUsers / 25);
        const workProject = await modelWorkProject.aggregate([
            { $match: { userMembers: email, deleteProject: deleteProject === true ? true : false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userAdmin',
                    foreignField: 'email',
                    as: 'infoUserAdmin',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'listWorkID',
                    foreignField: '_id',
                    as: 'infoListWork',
                },
            },
            { $project: { infoUserAdmin: { passWord: 0 } } },
            {$unwind:'$infoUserAdmin'},
            {
                $sort:
                    sortKey === 'nameProject'
                        ? { nameProject: sortOrder }
                        : sortKey === 'codeProject'
                          ? { codeProject: sortOrder }
                          : { createdAt: -1 },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);
        if (!workProject) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        return res.status(200).json({
            workProject,
            page,
            totalPages,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get data work Project',
        });
    }
};
// project detail
const ProjectDetail = async (req, res) => {
    try {
        const { codeProject } = req.params;
        if (!codeProject) {
            return res.status(404).json({
                message: 'is not codeProject project ',
            });
        }
        const project = await modelWorkProject.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userManagers',
                    foreignField: 'email',
                    as: 'infoUserManagers',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'listWorkID',
                    foreignField: '_id',
                    as: 'infoListWorkID',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userMembers',
                    foreignField: 'email',
                    as: 'infoUserMembers',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userAdmin',
                    foreignField: 'email',
                    as: 'infoUserAdmin',
                },
            },
            {
                $unwind: '$infoUserAdmin',
            },
            { $project: { infoUserManagers: { passWord: 0 } } },
            { $project: { infoUserMembers: { passWord: 0 } } },
            { $project: { infoUserAdmin: { passWord: 0 } } },
            { $match: { codeProject: codeProject } },
        ]);
        if (project.length === 0) {
            return res.status(404).json({
                message: 'not found project',
            });
        }
        return res.status(200).json(project[0]);
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get project detail',
        });
    }
};
// lấy list công việc của hàm getWorkProject đã lọc công việc theo id user trả về
const getListWork = async (req, res) => {
    try {
        const { nameProject } = req.query;
        const { _id } = req.user;
        if (!nameProject || !_id) {
            return res.status(404).json({
                message: 'not found id or nameProject',
            });
        }
        //check project
        const checkProject = await modelWorkProject.findOne({ userMembers: _id, nameProject: nameProject }).populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
        });
        if (!checkProject) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(checkProject);
    } catch (error) {
        res.status(404).json({
            message: 'can not get data list work  ',
        });
    }
};
//lấy công việc chi tiết của user qua lọc của hàm getListWork theo project
const getWorkDetail = async (req, res) => {
    try {
        const { parentIssue } = req.params;
        if (!parentIssue) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const WorkDetail = await modelListWork.findOne({ parentIssue: parentIssue });
        if (!WorkDetail) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(WorkDetail);
    } catch (error) {
        return res.status(404).json({
            message: 'can not get data work detail ',
        });
    }
};
// add new work
const addNewWork = async (req, res) => {
    try {
        const { _id } = req.user;
        const { nameProject, codeProject } = req.body;

        if (!_id || !nameProject || !codeProject) {
            return res.status(400).json({
                message: 'is not nameProject or codeProject or id',
            });
        }
        const checkCodeProject = await modelWorkProject.find({ codeProject: codeProject });
        const checkNameProject = await modelWorkProject.find({ nameProject: nameProject });

        if (checkCodeProject.length > 0 || checkNameProject.length > 0) {
            return res.status(401).json({
                message: 'already exists codeProject or checkNameProject',
            });
        }
        const randomImgProject = (Math.random() * dataImgProject.length) | 0;
        const newProject = new modelWorkProject({
            nameProject: nameProject,
            listWorkID: [],
            listManagers: [],
            admin: isemail,
            listMembers: [],
            codeProject: codeProject,
            startDay: new Date(),
            endDate: null,
            expected: '',
            describeProject: '',
            projectStatus: 'Chuẩn  bị',
            deleteProject: false,
            imgProject: dataImgProject[randomImgProject],
        });
        await newProject.save();
        return res.status(200).json({
            message: 'Add new successfully',
            data: newProject,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: 'Not found',
        });
    }
};
//delete project
const deleteProject = async (req, res) => {
    try {
        const { keyProject } = req.params;
        if (!keyProject) {
            return res.status(400).json({
                message: 'is not id',
            });
        }
        const findProjectID = await modelWorkProject.findOne({ codeProject: keyProject });
        if (!findProjectID) {
            return res.status(400).json({
                message: 'user not found',
            });
        }
        if (findProjectID.deleteProject === false) {
            findProjectID.deleteProject = true;
            await findProjectID.save();
        }
        setTimeout(async () => {
            const checkAfterTimeOut = await modelWorkProject.findOne({ codeProject: keyProject });
            if (checkAfterTimeOut.deleteProject === true) {
                await modelWorkProject.findOneAndDelete({ codeProject: keyProject });
            }
        }, 3600000);
        return res.status(200).json({
            message: 'Moved to trash',
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'Can not delete',
        });
    }
};
//restore project
const restoreProject = async (req, res) => {
    try {
        const { keyProject } = req.params;
        if (!keyProject) {
            return res.status(404).json({
                message: 'Is nos keyProject ',
            });
        }
        const checkId = await modelWorkProject.findOne({ codeProject: keyProject });
        if (!checkId) {
            return res.status(401).json({
                message: 'not found project want restore',
            });
        }
        if (checkId.deleteProject === false) {
            return res.status(404).json({
                message: 'Project no trash can',
            });
        }
        checkId.deleteProject = false;
        await checkId.save();
        return res.status(200).json({
            message: 'restore successfully',
        });
    } catch (error) {
        return res.status(404).json({
            message: 'Can not restore project',
        });
    }
};
//Delete existing members in the project
const DeleteExistingMembers = async (req, res) => {
    try {
        const { keyProject, _idMemberDelete } = req.params;
        if (!keyProject || !_idMemberDelete) {
            return res.status(404).json({
                message: 'Is nos id or _idMemberDelete',
            });
        }
        const project = await modelWorkProject.findOneAndUpdate(
            { codeProject: keyProject },
            { $pull: { userMembers: _idMemberDelete } },
            { new: true },
        );
        return res.status(200).json({
            message: 'Delete Existing Members Successfully',
            date: project,
        });
    } catch (error) {
        return res.status(404).json({
            message: 'error delete existing members',
        });
    }
};

const editProjectInformation = async (req, res) => {
    try {
        const { keyProject } = req.params;
        const { codeProject, nameProject, imgProject } = req.body;

        // check keyProject project
        if (!keyProject) {
            return res.status(404).json({
                message: 'not found keyProject',
            });
        }
        const project = await modelWorkProject.findOne({ codeProject: keyProject });

        // check project
        if (!project) {
            return res.status(400).json({
                message: 'Project not found',
            });
        }

        // check codeProject
        const checkCodeProject = await modelWorkProject.findOne({ codeProject });
        if (checkCodeProject && checkCodeProject.codeProject !== keyProject) {
            return res.status(400).json({
                message: 'codeProject already exists',
            });
        }

        if (codeProject && nameProject && imgProject) {
            project.codeProject = codeProject;
            project.nameProject = nameProject;
            project.imgProject = imgProject;
        } else if (codeProject) {
            project.codeProject = codeProject;
        } else if (nameProject) {
            project.nameProject = nameProject;
        } else if (imgProject) {
            project.imgProject = imgProject;
        }

        await project.save();
        return res.json({
            message: 'Edit project information successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(error.status).json({
            message: "Can't edit project information",
            error,
        });
    }
};
//list member
const ListMember = async (req, res) => {
    try {
        const { codeProject } = req.query;
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not codeProject',
            });
        }
        const memberProject = await modelWorkProject.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userMembers',
                    foreignField: 'email',
                    as: 'infoUserMembers',
                },
            },

            { $match: { codeProject: codeProject } },
        ]);
        console.log(memberProject.userMembers);
        return res.status(200).json(memberProject[0].infoUserMembers);
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get member project',
        });
    }
};

const sendEmailToUser = async (req, res) => {
    try {
        const { keyProject } = req.params;
        const { email, userName, role } = req.body;

        // check user in project
        const project = await modelWorkProject.findOne({ codeProject: keyProject });
        const user = await userModel.findOne({ email });
        if (user) {
            const findUserInProject = project.listMembers.find((emailUser) => emailUser === email);
            if (findUserInProject) {
                return res.status(400).json({
                    message: 'The user already exists in this project',
                });
            }
        }

        // token hết hạn sau 3p
        const payload = { email, role, userName };
        const token = jwt.sign(payload, process.env.SECRET_KEY_EMAIL, { expiresIn: 3 * 60 * 1000 });

        // gửi mail
        const mailOptions = {
            from: `${process.env.USER_EMAIL}`,
            to: `${email}`,
            subject: `${userName} invited you to join them in Workflow`,
            html: `
            <html>
            <body>
            <div
              id=":13f"
              class="ii gt"
              jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTc4MzcyNjA4NDk5MTQwNTM4MCJd; 4:WyIjbXNnLWY6MTc4MzcyNjA4NDk5MTQwNTM4MCJd"
            >
              <div id=":13e" class="a3s aiL msg-2887060111352600736">
                <u></u>
                <div
                  style="
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                      Oxygen, Ubuntu, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    letter-spacing: -0.005em;
                    color: #091e42;
                    line-height: 20px;
                    background: #ffffff;
                    height: 100%;
                    width: 100%;
                  "
                >
                  <table
                    width="100%"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    style="border-collapse: collapse"
                  >
                    <tbody>
                      <tr>
                        <td align="center">
                          <div style="max-width: 520px; margin: 0 auto">
                            <div
                              style="
                                vertical-align: top;
                                text-align: left;
                                font-family: -apple-system, BlinkMacSystemFont, Segoe UI,
                                  Roboto, Oxygen, Ubuntu, Fira Sans, Droid Sans,
                                  Helvetica Neue, sans-serif;
                                font-size: 14px;
                                font-weight: 400;
                                letter-spacing: -0.005em;
                                color: #091e42;
                                line-height: 20px;
                              "
                            >
                              <div
                                style="
                                  border: solid #ebecf0 1px;
                                  border-bottom: none;
                                  border-radius: 4px 4px 0 0;
                                  max-width: 520px;
                                "
                              >
                                <table
                                  style="
                                    background-image: url('https://ci3.googleusercontent.com/meips/ADKq_Namd0eL0mopCP-jRZLSOnD2W5HHUwYwuGcmfsY49BunHZVwdXSaTzBaHE2Ig-RHDlF_zfDKgxnXDrVeHT773kIwDqdZwrsPTqXIHcB2phJAi2i6S1Q0JuqeeKg=s0-d-e1-ft#https://id-mail-assets.atlassian.com/shared/white-background-10px.png');
                                    background-repeat: repeat;
                                    width: 100%;
                                    border-radius: 4px 4px 0 0;
                                    border-collapse: collapse;
                                  "
                                  width="100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <h1
                                          height="45"
                                          style="
                                            border: 0;
                                            line-height: 33px;
                                            outline: none;
                                            text-decoration: none;
                                            height: 100%;
                                            max-height: 45px;
                                            padding: 27px 0px 20px 40px;
                                          "
                                          border="0"
                                        >
                                          Workflow
                                        </h1>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div
                                style="
                                  margin-bottom: 32px;
                                  background: #fafbfc;
                                  padding: 40px;
                                  border-radius: 0 0 4px 4px;
                                  border: solid #ebecf0 1px;
                                  border-top: none;
                                "
                              >
                                <table
                                  width="100%"
                                  border="0"
                                  cellspacing="0"
                                  cellpadding="0"
                                  style="border-collapse: collapse"
                                >
                                  <tbody>
                                    <tr>
                                      <td align="center">
                                        <div style="max-width: 520px; margin: 0 auto">
                                          <table style="border-collapse: collapse">
                                            <tbody>
                                              <tr>
                                                <td>
                                                  <h1
                                                    style="
                                                      margin: 0px;
                                                      text-align: left;
                                                    "
                                                  >
                                                    <div style="line-height: 33px">
                                                    ${userName}
                                                      invited you to join them in
                                                      Workflow
                                                    </div>
                                                  </h1>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td>
                                                  <div
                                                    style="
                                                      font-family: -apple-system,
                                                        BlinkMacSystemFont, Segoe UI,
                                                        Roboto, Oxygen, Ubuntu,
                                                        Fira Sans, Droid Sans,
                                                        Helvetica Neue, sans-serif;
                                                      font-size: 14px;
                                                      font-weight: 400;
                                                      letter-spacing: -0.005em;
                                                      color: #091e42;
                                                      line-height: 20px;
                                                      margin-top: 16px;
                                                      text-align: left;
                                                    "
                                                  >
                                                    Start planning and tracking work
                                                    with and your team. You can share
                                                    your work and view what your team is
                                                    doing.
                                                  </div>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td>
                                                  <div
                                                    style="
                                                      display: flex;
                                                      margin-top: 24px;
                                                    "
                                                  >
                                                      <a
                                                        href=${process.env.URL_EMAIL_ADD_MEMBERS + '?token=' + token}
                                                        style="
                                                          cursor: pointer;
                                                          box-sizing: border-box;
                                                          border-radius: 3px;
                                                          border-width: 0;
                                                          border: none;
                                                          display: inline-flex;
                                                          font-style: normal;
                                                          font-size: inherit;
                                                          line-height: 24px;
                                                          margin: 0;
                                                          outline: none;
                                                          padding: 4px 12px;
                                                          text-align: center;
                                                          vertical-align: middle;
                                                          white-space: nowrap;
                                                          text-decoration: none;
                                                          background: #0052cc;
                                                          color: #ffffff;
                                                        "
                                                        target="_blank"
                                                      >
                                                        Accept Invite
                                                      </a>
                                                  </div>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td>
                                                  <div
                                                    style="
                                                      font-family: -apple-system,
                                                        BlinkMacSystemFont, Segoe UI,
                                                        Roboto, Oxygen, Ubuntu,
                                                        Fira Sans, Droid Sans,
                                                        Helvetica Neue, sans-serif;
                                                      font-size: 14px;
                                                      font-weight: 400;
                                                      letter-spacing: -0.005em;
                                                      color: #091e42;
                                                      line-height: 20px;
                                                      margin-top: 24px;
                                                    "
                                                  >
                                                    <span
                                                      style="
                                                        font-family: -apple-system,
                                                          BlinkMacSystemFont, Segoe UI,
                                                          Roboto, Oxygen, Ubuntu,
                                                          Fira Sans, Droid Sans,
                                                          Helvetica Neue, sans-serif;
                                                        font-size: 14px;
                                                        font-weight: 600;
                                                        letter-spacing: -0.003em;
                                                        color: #172b4d;
                                                        line-height: 16px;
                                                      "
                                                      >What is Workflow?</span
                                                    >
                                                    Project and issue tracking
                                                    <a
                                                      href="#"
                                                      style="
                                                        border: none;
                                                        background: transparent;
                                                        color: #0052cc;
                                                        text-decoration: none;
                                                      "
                                                      target="_blank"
                                                      >Learn more</a
                                                    >
                                                  </div>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div style="text-align: center; margin-bottom: 16px">
                                <div
                                  style="
                                    font-family: -apple-system, BlinkMacSystemFont,
                                      Segoe UI, Roboto, Oxygen, Ubuntu, Fira Sans,
                                      Droid Sans, Helvetica Neue, sans-serif;
                                    font-size: 14px;
                                    font-weight: normal;
                                    letter-spacing: -0.003em;
                                    color: #172b4d;
                                    line-height: 20px;
                                    margin: 16px 0;
                                  "
                                >
                                  This message was sent to you by Workflow Cloud
                                </div>
                                <a href="#" target="_blank"
                                  ><img
                                    src=""
                                    height="18"
                                    border="0"
                                    alt="Workflow logo"
                                    style="
                                      border: 0;
                                      line-height: 100%;
                                      outline: none;
                                      text-decoration: none;
                                      color: #c1c7d0;
                                    "
                                    class="CToWUd"
                                    data-bit="iit"
                                /></a>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <img
                    border="0"
                    width="1"
                    height="1"
                    alt=""
                    src="https://ci3.googleusercontent.com/meips/ADKq_NZ6DQbB1OP8gLtvDmpz_bVZf1rV1NpEeOA_jLwaogOm078H3NOkjIbAekoX93rka2upbORc5d8Sh5T5t8-XieRSIVpPHm_f5OMzN9YzoltR6z1nXloPMluTYeYaiVL5GJFkd_FyxY9HD_aWp8pEeu-ihvPWVa3L6yFUb3T1GKFiHAgORPOqMBwUrRZS9oBvmNLUnlo3ryDXMg2xEbJQlHNJZTnv6TO9rTpkqP7DslKmv55QiT1-1rs=s0-d-e1-ft#https://atlas-trk.prd.msg.ss-inf.net/q/5b45ZDS6G4Y3DYxywsuOCw~~/AAAAAQA~/RgRnRyZ6PlcLYXRsYXNzaWFudXNCCmVfeqFkZYRH9npSGm5ndXllbmJpbmgxOTExMDNAZ21haWwuY29tWAQAAAAA"
                    class="CToWUd"
                    data-bit="iit"
                  />
                  <div class="yj6qo"></div>
                  <div class="adL"></div>
                </div>
              </div>
              <div class="yj6qo"></div>
            </div>
          </body>
          </html>
            `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                res.status(400).json({
                    error: "The email wasn't sent successfully",
                });
            } else {
                res.json({
                    info: info.response,
                    email,
                    token,
                });
                console.log('Email đã được gửi:', info.response);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message,
        });
    }
};

const addMembersToProject = async (req, res) => {
    try {
        const { keyProject } = req.params;
        const { email, role } = req.user;

        // tìm dự án
        const project = await modelWorkProject.findOne({ codeProject: keyProject });

        if (!project) {
            return res.status(400).json({
                message: '_id not found',
            });
        }

        // check user trong project
        const isUserAdmin = project.admin === email.toString();
        const isUserManager = project.listManagers.includes(email.toString());
        const isUserMember = project.listMembers.includes(email.toString());

        if (isUserAdmin || isUserManager || isUserMember) {
            return res.status(400).json({
                message: 'The user already exists in the project',
            });
        }

        // add user
        switch (role) {
            case 'admin':
                project.admin = email;
                break;
            case 'manager':
                project.listManagers.push(email);
                break;
            case 'member':
                project.listMembers.push(email);
                break;
            default:
                return res.status(400).json({
                    message: 'role not found',
                });
        }

        await project.save();
        res.json({
            message: 'Added user successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message,
        });
    }
};

const updatePermissions = async (req, res) => {
    try {
        const { keyProject } = req.params;
        const { email, role } = req.body;

        if (!keyProject || !email || !role) {
            return res.status(400).json({
                message: 'keyProject or email or role not found',
            });
        }

        const project = await modelWorkProject.findOne({ codeProject: keyProject });
        const user = await modelUser.findOne({ email });

        if (!project || !user) {
            return res.status(400).json({
                message: 'keyProject or email does not exist',
            });
        }
        const isUserManager = project.listManagers.includes(email);
        const isUserMember = project.listMembers.includes(email);

        switch (role) {
            case 'manager':
                if (project.listManagers.length <= 3 && !isUserManager && project.admin !== email) {
                    if (isUserMember) {
                        const index = project.listMembers.indexOf(email);
                        project.listMembers.splice(index, 1);
                    }
                    project.listManagers.push(email);
                }
                break;
            case 'member':
                if (isUserManager) {
                    const index = project.listManagers.indexOf(email);
                    project.listManagers.splice(index, 1);
                }
                if (!isUserMember && project.admin !== email) project.listMembers.push(email);
                break;

            default:
                return res.status(400).json({
                    message: 'incorrect rights',
                });
        }

        await project.save();
        res.json({
            message: 'Updated permissions successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
};

module.exports = {
    DeleteExistingMembers,
    restoreProject,
    getWorkProject,
    getListWork,
    getWorkDetail,
    editProjectInformation,
    deleteProject,
    addNewWork,
    sendEmailToUser,
    addMembersToProject,
    ListMember,
    ProjectDetail,
    updatePermissions,
};
