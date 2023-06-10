const userauthentication = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/home')
        } else {
            next()
        }

    } catch (error) {
        res.status(500).send("Inernal error occured")
    }
}

const userCheck = async (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            res.redirect('/')
        }

    } catch (error) {
        res.status(500).send("Inernal error occured")
    }
}

const adminauthentication = async (req, res, next) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/adminpanel')
        } else {
            next()
        }

    } catch (error) {
        res.status(500).send("Inernal error occured")
    }
}
const admincheck = async (req, res, next) => {
    try {
        if (req.session.admin) {
            next()

        } else {
            res.redirect('/admin')

        }

    } catch (error) {
        res.status(500).send("Inernal error occured")
    }
}




module.exports = {
    userauthentication,
    adminauthentication,
    userCheck,
    admincheck
}
