var awesomeQuotez = function (url,createType) {
    return {
        submit: function (e) {
            var data = $(e.target).sdSerializeObject();

            var submitDeferred = $.Deferred();

            // mapping error collection from xhr
            ajax.post(AJS.contextPath() + url, data)
                .fail(function (xhr) {
                    submitDeferred.reject(ajax.getErrorCollection(xhr));
                })
                .done(function (data) {
                    submitDeferred.resolve(data);
                });

            FormMixin.handleSubmit
                .call(this, submitDeferred, {
                    showSuccess: true
                })
                .done(_.bind(this.success, this));

            // To make the UI more responsive, we clear the error dialogue
            this._hideGenericError();
            e.preventDefault();
        },
        success: function (data) {
            Cookie.save("sd.create.first", "true");
            tracker.trackPageview("/admin/kanye/enable/"+createType);
            utils.goToUrl(AJS.contextPath() + '/kanye/agent/' + data.projectKey + "/queues");
        },
        _hideGenericError: function(errorMessage) {
            var $errorContainer = $('#error-container').hide();
            var $errorList = $errorContainer.find('ul');
            $errorList.empty();
        }
    }
};


/**
 * View that renders a form to create quotes from an existing project
 */
var CreateFromExistingView = Brace.View.extend({

    mixins: [persistMixin("/rest/kanye/1/kanye","existing"), FormMixin],

    template: kanye.Templates.Admin.Createkanye.fromExisting,

    events: {
        "submit": "submit"
    },
    bindSingleSelect: function () {
        var $ss = this.$("#sd-Project");
        if (!$ss.data("ss-bound")) {
            $ss.data("ss-bound", true);
            new SingleSelect({element: $ss, itemAttrDisplayed: "label"});
        }
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON())).removeClass("hidden").show();
        this.bindSingleSelect();
        this.$el.find(":input:visible:first").focus();
    }
});

/**
 * View that renders a form to create a new quotes project
 */
var CreateFromScratchView = Brace.View.extend({

    mixins: [persistMixin("/rest/kanye/1/kanye/gettingstarted","new"), FormMixin],

    template: kanye.Templates.Admin.Createkanye.fromNew,

    events: {
        "input #project-name": "generateProjectKey",
        "input #project-key" : "uppercaseProjectKey",
        "click .sd-cancel-create": "clear",
        "submit": "submit"
    },
    initialize: function () {
        this.keygen = new JiraProjectKeyGenerator({desiredKeyLength: 4, maxKeyLength: 10});
    },
    clear: function () {
        this.$(":text").val("");
    },
    bindKeyHelp: function () {
        new InlineDialog(this.$(".project-key-help"), "project-key-help-popup", function (contents, trigger, show) {
            contents.html(JIRA.Templates.CreateProject.keyHelp());
            show();
        }, {width: 330, offsetX: -30});
    },
    generateProjectKey: function (e) {
        var projectName = $(e.target).val();
        this.$("#project-key").val(this.keygen.generateKey(projectName));
        trace("sd.admin.create.kanye.key.generated.and.set");
    },
    uppercaseProjectKey: function (e) {
        var projectKey = $(e.target).val();
        this.$("#project-key").val(projectKey.toUpperCase());
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON())).removeClass("hidden").show();
        this.$el.find(":input:visible:first").focus();
        this.bindKeyHelp();
    }
});

/**
 * A composite view, that manages the display of create from existing & create from new based on the user selection.
 */
var CreatekanyeView = Brace.View.extend({

    events: {
        "click .sd-existing-button": "enableFromExisting",
        "click .sd-createnew-button": "enableFromScratch",
        "click .sd-gs-close-button": "hideDialog",
        "click .sd-cancel-create": "showOptions"
    },

    template: kanye.Templates.Admin.Createkanye.dialog,

    initialize: function () {
        this.fromExistingView = new CreateFromExistingView({
            model: this.model
        });
        this.fromScratchView = new CreateFromScratchView({
            model: this.model
        });
    },
    hideDialog: function (e) {
        JIRA.Dialogs.globalAddViewport.hide();
        e.preventDefault();
    },
    showOptions: function (e) {
        this.fromScratchView.$el.hide();
        this.fromExistingView.$el.hide();
        this.$createOptions.show();
        e.preventDefault();
    },
    enableFromExisting: function (e) {
        this.$createOptions.hide();
        this.fromScratchView.$el.hide();
        this.fromExistingView.render();
        e.preventDefault();
    },
    enableFromScratch: function (e) {
        this.$createOptions.hide();
        this.fromExistingView.$el.hide();
        this.fromScratchView.render();
        e.preventDefault();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.fromExistingView.setElement(this.$(".sd-gs-create-existing-container"));
        this.fromScratchView.setElement(this.$(".sd-gs-create-new"));
        this.$createOptions = this.$(".sd-gs-buttons");
        return this.$el;
    }
});

exports.quotes = {
    giveMe: function (targetEl) {
        var deferred = $.Deferred();
        ajax.get(AJS.contextPath() + "/", _.bind(function (xhr, status, res) {
            var createkanyeView = new CreatekanyeView({model: new DisplayModel(res.data), el: targetEl});
            var $el = createkanyeView.render();
            deferred.resolve($el);
        }));
        return deferred.promise();
    }
};

exports.kanye {
    showOptions: function (e) {
        this.fromScratchView.$el.hide();
        this.fromExistingView.$el.hide();
        this.$createOptions.show();
        e.preventDefault();
    },
    enableFromExisting: function (e) {
        this.$createOptions.hide();
        this.fromScratchView.$el.hide();
        this.fromExistingView.render();
        e.preventDefault();
    },
    enableFromScratch: function (e) {
        this.$createOptions.hide();
        this.fromExistingView.$el.hide();
        this.fromScratchView.render();
        e.preventDefault();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.fromExistingView.setElement(this.$(".sd-gs-create-existing-container"));
        this.fromScratchView.setElement(this.$(".sd-gs-create-new"));
        this.$createOptions = this.$(".sd-gs-buttons");
        return this.$el;
    },
    create: function() {
        return this.giveMeSuperInspirationalKanyeQuotes();
    }
}
