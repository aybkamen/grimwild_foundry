export class StoryKitPieceDialog extends foundry.applications.api.DialogV2 {
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        position: { width: 640, height: "auto" },
        modal: true,
        rejectClose: false
    };

    static _contentTemplate(piece) {
        const t = piece?.title ?? "";
        return `
        <div class="storykit-piece-editor">
            <label>${game.i18n?.localize?.("Title") ?? "Title"}</label>
            <input type="text" class="form-input" data-role="title" value="${foundry.utils.escapeHTML(t)}"/>
            <label style="margin-top:8px;">${game.i18n?.localize?.("Description") ?? "Description"}</label>
            <div class="pm-mount" data-role="description"></div>
            <div class="pm-preview" data-role="preview" style="margin-top:6px;"></div>
        </div>`;
    }

    static _render(event, application) {
        const html = application.element;
        // Mount ProseMirror editor into placeholder
        const mount = html.querySelector('[data-role="description"]');
        if (!mount) return;
        // Build editor; default open
        const editor = foundry.applications.elements.HTMLProseMirrorElement.create({
            toggled: true,
            collaborate: false,
            autosave: false,
            name: "piece.description",
            height: 260,
            value: application.options.piece?.description ?? ""
        });
        editor.dataset.role = 'description-editor';
        mount.replaceChildren(editor);

        // Attach preview element which shows when editor is closed
        const preview = html.querySelector('[data-role="preview"]');
        const updatePreview = async () => {
            if (!preview) return;
            try {
                const raw = editor?.value ?? "";
                const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(raw, { secrets: true });
                preview.innerHTML = enriched ?? "";
                const open = editor?.hasAttribute?.('open');
                preview.style.display = open ? 'none' : '';
            } catch (_) {
                // best-effort; leave preview empty on error
            }
        };
        // Keep preview synced on changes and open/close
        editor?.addEventListener?.('change', updatePreview);
        editor?.addEventListener?.('blur', updatePreview);
        const mo = new MutationObserver(updatePreview);
        mo.observe(editor, { attributes: true, attributeFilter: ['open'] });
        // Initial paint
        updatePreview();
    }

    static async open({ piece, ...options } = {}) {
        options.content = this._contentTemplate(piece ?? { title: "", description: "" });
        options.render = this._render;
        options.window = { title: game.i18n?.localize?.("Edit") ?? "Edit" };
        options.piece = piece ?? { title: "", description: "" };
        options.buttons = [
            {
                label: game.i18n?.localize?.("Save") ?? "Save",
                action: "save",
                callback: (event, button, dialog) => {
                    const title = dialog.element.querySelector('[data-role="title"]').value ?? "";
                    const editor = dialog.element.querySelector('[data-role="description-editor"]');
                    const description = editor?.value ?? "";
                    return { title, description };
                }
            },
            { label: game.i18n?.localize?.("Cancel") ?? "Cancel", action: "cancel" }
        ];
        return super.wait(options);
    }
}
