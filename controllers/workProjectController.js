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
        const { sortKey } = req.query;
        const { _id } = req.params;
        const { deleteProject } = req.body;
        const page = parseInt(req.query.page) || 1;
        const sortOrder = parseInt(req.query.sortOrder) || 1;
        const limit = parseInt(req.query.limit) || 25;
        if (!_id || deleteProject === '') {
            return res.status(404).json({
                message: 'not found id or deleteProject',
            });
        }
        const totalUsers = await modelWorkProject.countDocuments();
    
        const totalPages = Math.ceil(totalUsers / 25);
        const workProject = await modelWorkProject
            .find({ memberID: _id, deleteProject: deleteProject })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            })
            .populate({
                path: 'adminID',
                select: '-refreshToken -passWord',
            })
            .sort(
                sortKey === 'nameProject'
                    ? { nameProject: sortOrder }
                    : sortKey === 'codeProject'
                      ? { codeProject: sortOrder }
                      : {},
            )
            .skip((page - 1) * limit)
            .limit(limit);

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
        const {codeProject} = req.params;
        if (!codeProject) {
            return res.status(404).json({
                message: 'is not codeProject project ',
            });
        }
        const project = await modelWorkProject
            .findOne({codeProject})
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
                populate: {
                    path: 'workDetrailID',
                },
            })
            .populate({
                path: 'adminID',
                select: '-refreshToken -passWord',
            })
            .populate({
                path: 'memberID',
                select: '-refreshToken -passWord',
            });
        if (!project) {
            return res.status(404).json({
                message: 'not found project',
            });
        }
        return res.status(200).json(project);
    } catch (error) {
      console.log(error)
        return res.status(404).json({
            message: 'can not get project detail',
        });
    }
};
// lấy list công việc của hàm getWorkProject đã lọc công việc theo id user trả về
const getListWork = async (req, res) => {
    try {
        const { nameProject } = req.body;

        if (!nameProject) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        //check project
        const checkProject = await modelWorkProject.findOne({ nameProject: nameProject }).populate({
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
        const { workDetrailID } = req.body;
        if (!workDetrailID) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const WorkDetail = await modalWorkDetail.find({ _id: { $in: workDetrailID } });
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
        const { _id } = req.params;
        const { nameProject, codeProject } = req.body;

        if (!_id || !nameProject || !codeProject) {
            return res.status(400).json({
                message: 'is not nameProject or codeProject or id',
            });
        }
        const checkCodeProject = await modelWorkProject.find({ memberID: _id, codeProject: codeProject });
        const checkNameProject = await modelWorkProject.find({ memberID: _id, nameProject: nameProject });

        if (checkCodeProject.length > 0 || checkNameProject.length > 0) {
            return res.status(401).json({
                message: 'already exists codeProject or checkNameProject',
            });
        }
        const randomImgProject = (Math.random() * dataImgProject.length) | 0;
        const newProject = new modelWorkProject({
            nameProject: nameProject,
            listWorkID: [],
            managerID: [],
            adminID: { _id },
            memberID: [_id],
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
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                message: 'is not id',
            });
        }
        const findProjectID = await modelWorkProject.findById(_id);
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
            const checkAfterTimeOut = await modelWorkProject.findById(_id);
            if (checkAfterTimeOut.deleteProject === true) {
                await modelWorkProject.findByIdAndDelete(_id);
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
        const { _id } = req.params;
        if (!_id) {
            return res.status(404).json({
                message: 'Is nos id or restoreProject',
            });
        }
        const checkId = await modelWorkProject.findById(_id);
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
        const { _id } = req.params;
        const { _idMemberDelete } = req.body;
        if (!_id || !_idMemberDelete) {
            return res.status(404).json({
                message: 'Is nos id or _idMemberDelete',
            });
        }
        const project = await modelWorkProject.findOneAndUpdate(
            { _id: _id },
            { $pull: { memberID: _idMemberDelete } },
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
        const { _id } = req.params;
        const { codeProject, nameProject } = req.body;

        // check id project
        if (!_id) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const project = await modelWorkProject.findById({ _id }).populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
        });

        // check project
        if (!project) {
            return res.status(400).json({
                message: 'Project not found',
            });
        }

        // check codeProject
        const checkCodeProject = await modelWorkProject.findOne({ codeProject });
        if (checkCodeProject && checkCodeProject._id.toString() !== _id) {
            return res.status(400).json({
                message: 'codeProject already exists',
            });
        }

        if (codeProject && nameProject) {
            project.codeProject = codeProject;
            project.nameProject = nameProject;
        } else if (codeProject) {
            project.codeProject = codeProject;
        } else if (nameProject) {
            project.nameProject = nameProject;
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
    } catch (error) {}
};

const sendEmailToUser = async (req, res) => {
    try {
        const { _id } = req.params;
        const { email, userName } = req.body;

        // check user in project
        const project = await modelWorkProject.findById({ _id });
        const user = await userModel.findOne({ email });
        if (user) {
            const findUserInProject = project.emailUser.find((emailUser) => emailUser === email);
            if (findUserInProject) {
                return res.status(400).json({
                    message: 'The user already exists in this project',
                });
            }
        }

        // token hết hạn sau 3p
        const payload = { email };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 3 * 60 * 1000 });

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
                                                        href=${process.env.URL_EMAIL_ADD_MEMBERS}
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
            error,
        });
    }
};

const addMembersToProject = async (req, res) => {
    try {
        const { _id } = req.params;
        const { email } = req.query;

        // tìm dự án và người dùng
        const project = await modelWorkProject.findById({ _id });

        if (!project) {
            return res.status(400).json({
                message: '_id or _idUser not found',
            });
        }

        // check user trong project
        const findUserInProject = project.emailUser.find((emailUser) => emailUser === email);
        if (findUserInProject) {
            return res.status(400).json({
                message: 'The user already exists in the project',
            });
        }
        project.emailUser.push(email.toString());

        await project.save();
        res.json({
            message: 'Added user successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error,
        });
    }
};

const updatePermissions = async (req, res) => {
    try {
        const { _id } = req.params;
        const { _idUserUpdate, role } = req.body;

        if (!_id || !_idUserUpdate) {
            return res.status(400).json({
                message: '_id or _idUserUpdate not found',
            });
        }

        const project = await modelWorkProject.findById({ _id });
        const user = await modelUser.findById({ _id: _idUserUpdate });

        if (!project || !user) {
            return res.status(400).json({
                message: '_id or _idUser does not exist',
            });
        }

        const isUserInProject = project.emailUser.find((emailUser) => emailUser === user.email);
        const isUserManager = project.managerID.find((id) => id.toString() === user._id.toString());
        const isUserSupervisor = project.supervisor.find((id) => id.toString() === user._id.toString());

        if (!isUserInProject) {
            return res.status(400).json({
                message: 'the user do not exist in the project',
            });
        }

        switch (role) {
            case 'admin':
                project.adminID = user._id;
                break;
            case 'manager':
                if (project.managerID.length <= 3 && !isUserManager) project.managerID.push(user._id);
                break;
            case 'supervisor':
                if (!isUserSupervisor) project.supervisor.push(user._id);
                break;
            case 'member':
                if (isUserManager)
                    project.managerID = project.managerID.filter((id) => id.toString() !== user._id.toString());
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
