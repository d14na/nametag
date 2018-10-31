class ZeroApp extends ZeroApi {
    setSiteInfo(_siteInfo) {
        /* Set Zer0net summary details. */
        App.ziteAddress = _siteInfo.address
        App.zitePeers = _siteInfo.peers
        App.ziteSize = _siteInfo.settings.size
    }

    onOpen() {
        /* Call super. */
        super.onOpen()

        this.cmd('siteInfo', [], function (_siteInfo) {
            Zero.setSiteInfo(_siteInfo)
        })
    }

    onEvent(_event, _message) {
        if (_event === 'setSiteInfo') {
            this.setSiteInfo(_message.params)
        } else {
            this._log('Unknown event:', _event)
        }
    }
}

/**
 * Vue Application Manager (Configuration)
 */
const vueAppManager = {
    el: '#app',
    data: () => ({
        /* ZeroApp / ZeroApi Manager */
        zero: null,

        /* App Summary */
        appTitle: 'Nametag',
        appDesc: 'Your <strong>Official</strong> Passport to the <strong>TrustLess Web&trade;</strong>',

        /* Zite Summary */
        ziteAddress: 'n/a',
        zitePeers: 0,
        ziteSize: 0,

        /* Proof-of-work */
        hash: null,
        challenge: null,
        nonce: null,
        startDate: null,
        powResults: null
    }),
    mounted: function () {
        /* Initialize application. */
        this._init()
    },
    computed: {
        // TODO
    },
    methods: {
        _init: function () {
            /* Initialize new Zer0net app manager. */
            // NOTE Globally accessible (e.g. Zero.cmd(...))
            window.Zero = new ZeroApp()

            console.info('App.() & Zero.() have loaded successfully!')
        },

        _genChallenge: function () {
            let longString = ''

            // for (let i = 0; i < 100; i += 1) {
            for (let i = 0; i < 1000; i += 1) {
            // for (let i = 0; i < 1000000; i += 1) {
                longString += Math.random().toString(36).substr(2, 1)
            }

            return longString
        },

        /**
         * Proof-of-work Processing
         *
         * NOTE: Based on the Hashcash POW system.
         *       (https://en.wikipedia.org/wiki/Hashcash)
         */
        pow: function () {
            /* Generate initial hash. */
            this.hash = CryptoJS.createHash('sha256').update(this.challenge + this.nonce).digest('hex')

            /* Validate hash. */
            if (this.hash.substr(0, 3) !== '000') {
            // if (this.hash.substr(0, 4) !== '0000') {
                // this.hash = CryptoJS.createHash('sha256').update(this.challenge + this.nonce).digest('hex')

                /* Increment nonce. */
                this.nonce++

                /* Slight delay (avoid unresponsive browser). */
                setTimeout(this.pow, 0)
                // this.pow()
            } else {
                /* Set end date. */
                const endDate = new Date()

                /* Set POW results. */
                const powResults = `
<div class="card mt-3">
    <div class="card-body">
    Your POW answer is [ <strong class="text-info">${numeral(this.nonce).format('0,0')}</strong> ], with a calculated hash of
    <br />[ <strong class="text-info">${this.hash.slice(0, 16)} ... ${this.hash.slice(-16)}</strong> ],
    <br />and it took [ <strong class="text-info">${(endDate - this.startDate) / 1000}</strong> ] seconds to complete.
    </div>
</div>
                `

                this.powResults = powResults
            }
        },

        importKey: function () {
            Zero.cmd('wrapperPrompt', ['Enter your private key:', 'password'], (_input) => {
                Zero.cmd('wrapperNotification', ['done', `Nice! I see you entered [${_input}]`, 7000])
            })
        },

        register: function () {
            /* Generate new challenge. */
            this.challenge = this._genChallenge()

            /* Initialize nonce. */
            this.nonce = 0

            /* Initialize start date. */
            this.startDate = new Date()

            console.info(`POW Challenge [ ${this.challenge.length} bytes ]`)

            this.pow()
        }
    }
}

/* Initialize the Vue app manager. */
const App = new Vue(vueAppManager)
