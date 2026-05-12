from django.contrib import admin
from .models import Proposal, ProposalTemplate


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ["job", "user", "status", "generated_at"]
    list_filter = ["status", "generated_at"]
    search_fields = ["job__title", "content"]
    readonly_fields = ["generated_at", "word_count"]


@admin.register(ProposalTemplate)
class ProposalTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "is_active", "usage_count"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "description"]
    readonly_fields = ["usage_count", "created_at"]
