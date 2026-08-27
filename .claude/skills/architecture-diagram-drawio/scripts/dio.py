"""
dio.py - a tiny helper library for building valid draw.io (mxGraph) XML by hand.

Why this exists: hand-writing mxGraphModel XML is error-prone (duplicate ids,
unescaped labels, mismatched parents). This module does the bookkeeping so the
author can focus on *layout decisions* (where things go, what connects to
what) instead of XML mechanics. It intentionally does NOT do automatic layout
- every x/y/width/height is chosen deliberately by the caller, because
auto-layout tends to produce ugly, hard-to-read architecture diagrams.

Used by generate_templates.py to build the bundled templates/, and can be
reused directly whenever a new one-off diagram is needed that doesn't match
an existing template.
"""

from __future__ import annotations

import xml.sax.saxutils as sx
from dataclasses import dataclass, field

GRID = 20  # snap coordinates to this grid for visual alignment

# Standard node sizes (in px) - keep icons consistent within a diagram.
ICON_L = 78   # large resource icon (default AWS4 resourceIcon size)
ICON_M = 60   # medium icon
ICON_S = 48   # small icon
ACTOR_W, ACTOR_H = 60, 70  # user/external actor

EDGE_STYLE = "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;fontSize=11;strokeColor=#545B64;"
EDGE_STYLE_BOLD = "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;fontSize=11;strokeColor=#232F3E;strokeWidth=2;"


def esc(s: str) -> str:
    return sx.escape(str(s), {'"': "&quot;", "\n": "&#10;"})


@dataclass
class Diagram:
    width: int = 1700
    height: int = 1200
    _cells: list[str] = field(default_factory=list)
    _id_counter: int = 0

    def _next_id(self, prefix: str) -> str:
        self._id_counter += 1
        return f"{prefix}{self._id_counter}"

    def node(self, label, style, x, y, w=ICON_L, h=ICON_L, parent="1", id=None) -> str:
        """Add a leaf node (icon, box, actor). Returns its id for use as edge source/target."""
        id = id or self._next_id("n")
        self._cells.append(
            f'<mxCell id="{esc(id)}" value="{esc(label)}" style="{esc(style)}" '
            f'vertex="1" parent="{esc(parent)}">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
        )
        return id

    def container(self, label, style, x, y, w, h, parent="1", id=None) -> str:
        """Add a container (VPC, subnet, region, tenant boundary, swimlane...).
        Children must be added with parent=<this id> and coordinates RELATIVE
        to the container's own top-left corner (draw.io convention)."""
        id = id or self._next_id("grp")
        self._cells.append(
            f'<mxCell id="{esc(id)}" value="{esc(label)}" style="{esc(style)}" '
            f'vertex="1" parent="{esc(parent)}">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
        )
        return id

    def edge(self, source, target, label="", style=None, dashed=False, id=None) -> str:
        id = id or self._next_id("e")
        st = style or EDGE_STYLE
        if dashed:
            st += "dashed=1;"
        self._cells.append(
            f'<mxCell id="{esc(id)}" value="{esc(label)}" style="{esc(st)}" '
            f'edge="1" source="{esc(source)}" target="{esc(target)}" parent="1">'
            f'<mxGeometry relative="1" as="geometry"/></mxCell>'
        )
        return id

    def text(self, label, x, y, w=200, h=30, parent="1", style=None, id=None) -> str:
        """Free-floating label / section title (no border)."""
        st = style or (
            "text;html=1;align=left;verticalAlign=middle;fontSize=15;fontStyle=1;"
            "fontColor=#232F3E;"
        )
        return self.node(label, st, x, y, w, h, parent, id)

    def to_mxgraph_xml(self) -> str:
        body = "".join(self._cells)
        return (
            f'<mxGraphModel dx="1422" dy="762" grid="1" gridSize="{GRID}" guides="1" '
            f'tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" '
            f'pageWidth="{self.width}" pageHeight="{self.height}" math="0" shadow="0">'
            f"<root>"
            f'<mxCell id="0"/><mxCell id="1" parent="0"/>'
            f"{body}"
            f"</root></mxGraphModel>"
        )

    def save(self, path: str, name: str = "Page-1") -> None:
        """Write a standalone, uncompressed .drawio file (openable in the
        desktop/web app and readable via list_pages/get_page)."""
        xml = self.to_mxgraph_xml()
        mxfile = (
            '<mxfile host="65bd71144e">'
            f'<diagram name="{esc(name)}" id="{esc(name.lower().replace(" ", "-"))}">'
            f"{xml}"
            f"</diagram></mxfile>"
        )
        with open(path, "w", encoding="utf-8") as f:
            f.write(mxfile)


# ---------------------------------------------------------------------------
# AWS4 icon/container style library - verified against the live draw.io shape
# search (mcp__drawio__search_shapes) on 2026-08-27. Do not hand-edit colors
# without re-verifying; AWS4 category colors are visually meaningful.
# ---------------------------------------------------------------------------

def _res(icon: str, color: str, w=ICON_L, h=ICON_L) -> str:
    return (
        "sketch=0;outlineConnect=0;fontColor=#232F3E;gradientColor=none;"
        f"fillColor={color};strokeColor=none;dashed=0;verticalLabelPosition=bottom;"
        "verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;"
        f"pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.{icon};"
    )


# category colors (AWS4 2021+ icon set)
COMPUTE = "#ED7100"
STORAGE = "#7AA116"
DATABASE = "#C925D1"
NETWORKING = "#8C4FFF"
SECURITY = "#DD344C"
INTEGRATION = "#E7157B"
ML = "#01A88D"

AWS = {
    # compute
    "ec2": _res("ec2", COMPUTE),
    "lambda": _res("lambda", COMPUTE),
    "ecs_fargate": _res("fargate", COMPUTE),
    "eks": _res("eks", COMPUTE),
    "ecr": _res("ecr", COMPUTE),
    # storage
    "s3": _res("s3", STORAGE),
    "ebs": _res("elastic_block_store", STORAGE),
    "backup": _res("backup", STORAGE),
    # database
    "rds": _res("rds", DATABASE),
    "dynamodb": _res("dynamodb", DATABASE),
    "aurora": _res("aurora", DATABASE),
    # networking / content delivery
    "alb": _res("application_load_balancer", NETWORKING),
    "nlb": _res("network_load_balancer", NETWORKING),
    "route53": _res("route_53", NETWORKING),
    "cloudfront": _res("cloudfront", NETWORKING),
    "global_accelerator": _res("global_accelerator", NETWORKING),
    "transit_gateway": _res("transit_gateway", NETWORKING),
    "nat_gateway": _res("nat_gateway", NETWORKING),
    "direct_connect": _res("direct_connect", NETWORKING),
    "vpn_gateway": _res("site_to_site_vpn", NETWORKING),
    "internet_gateway": _res("internet_gateway", NETWORKING),
    "vpc_endpoint": _res("endpoints", NETWORKING),
    "opensearch": _res("elasticsearch_service", NETWORKING),
    # analytics
    "glue": _res("glue", NETWORKING),
    "athena": _res("athena", NETWORKING),
    "kinesis": _res("kinesis_data_streams", NETWORKING),
    "kinesis_data_analytics": _res("kinesis_data_analytics", NETWORKING),
    "redshift": _res("redshift", NETWORKING),
    "quicksight": _res("quicksight", NETWORKING),
    # media
    "mediaconvert": _res("elemental_mediaconvert", COMPUTE),
    # iot
    "iot_core": _res("iot_core", STORAGE),
    # elasticache
    "elasticache_redis": _res("elasticache_for_redis", DATABASE),
    # app integration
    "eventbridge": _res("eventbridge", INTEGRATION),
    "sqs": _res("sqs", INTEGRATION),
    "sns": _res("sns", INTEGRATION),
    "api_gateway": _res("api_gateway", NETWORKING),
    # security / identity
    "waf": _res("waf", SECURITY),
    "shield": _res("shield", SECURITY),
    "guardduty": _res("guardduty", SECURITY),
    "cognito": _res("cognito", SECURITY),
    "secrets_manager": _res("secrets_manager", SECURITY),
    "kms": _res("key_management_service", SECURITY),
    "iam_role": _res("role", SECURITY),
    # management/governance
    "cloudwatch": _res("cloudwatch", INTEGRATION),
    "systems_manager": _res("systems_manager", INTEGRATION),
    "organizations_account": _res("organizations_account", INTEGRATION),
    "organizational_unit": _res("organizations_organizational_unit2", INTEGRATION),
    "control_tower": _res("control_tower", INTEGRATION),
    "cloudtrail": _res("cloudtrail", INTEGRATION),
    "config": _res("config", INTEGRATION),
    "codepipeline": _res("codepipeline", DATABASE),
    "codebuild": _res("codebuild", DATABASE),
    # ml / ai
    "bedrock": _res("bedrock", ML),
    "bedrock_agentcore": _res("bedrock_agentcore", ML),
    "sagemaker": _res("sagemaker", ML),
    # blockchain
    "managed_blockchain": _res("managed_blockchain", COMPUTE),
    # actors
    "user": "shape=mxgraph.aws4.user;fillColor=#232F3E;fontColor=#ffffff;strokeColor=none;fontSize=11;",
    "internet": "shape=mxgraph.aws4.internet;fillColor=#232F3E;fontColor=#ffffff;strokeColor=none;fontSize=11;",
    # step functions (no plain resourceIcon variant published; use productIcon)
    "step_functions": (
        "sketch=0;outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=#ffffff;"
        "fillColor=#232F3E;dashed=0;verticalLabelPosition=middle;verticalAlign=bottom;"
        "align=center;html=1;whiteSpace=wrap;fontSize=10;fontStyle=1;spacing=3;"
        "shape=mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.step_functions;"
    ),
}

# container ("group") styles - draw an outer boundary with a labeled icon in
# the corner. `points=[...]` is the AWS4 dashed-corner outline; keep it as-is.
_GROUP_POINTS = (
    "points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],"
    "[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];"
)


def group_style(gr_icon: str, fill: str, stroke: str) -> str:
    return (
        f"{_GROUP_POINTS}shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.{gr_icon};"
        f"grStroke=0;verticalLabelPosition=top;verticalAlign=bottom;fillColor={fill};"
        f"strokeColor={stroke};fontStyle=1;fontSize=13;"
    )


GROUPS = {
    "vpc": group_style("group_vpc", "#E6F3FB", "#147EBA"),
    "public_subnet": group_style("group_public_subnet", "#E9F3E6", "#7AA116"),
    "private_subnet": group_style("group_private_subnet", "#FCE9EA", "#DD344C"),
    "isolated_subnet": group_style("group_private_subnet", "#F2F2F2", "#545B64"),
    "security_group": group_style("group_security_group", "none", "#DD344C"),
    "region": (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#F2F8FD;strokeColor=#147EBA;"
        "strokeWidth=2;dashed=0;verticalAlign=top;align=left;spacingLeft=12;"
        "spacingTop=8;fontStyle=1;fontSize=14;fontColor=#147EBA;"
    ),
    "az": (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#7D8998;"
        "dashed=1;verticalAlign=top;align=left;spacingLeft=10;spacingTop=6;"
        "fontStyle=1;fontSize=12;fontColor=#545B64;"
    ),
    "generic": (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#666666;"
        "verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;fontStyle=1;"
        "fontSize=13;"
    ),
    "tenant": (
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF6E6;strokeColor=#D6A419;"
        "verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;fontStyle=1;"
        "fontSize=13;"
    ),
}

# Generic (cloud/domain-agnostic) shapes for blockchain & AI diagrams where no
# AWS icon applies.
GENERIC = {
    "actor": "shape=umlActor;html=1;verticalLabelPosition=bottom;verticalAlign=top;fontSize=11;",
    "db_cylinder": "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=11;",
    "box": "rounded=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=12;",
    "box_purple": "rounded=1;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontSize=12;",
    "box_green": "rounded=1;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontSize=12;",
    "box_orange": "rounded=1;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontSize=12;",
    "box_gray": "rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#666666;fontSize=12;",
    "hexagon": "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#D5E8D4;strokeColor=#82B366;fontSize=11;",
    "wallet": (
        "image;aspect=fixed;perimeter=ellipsePerimeter;html=1;align=center;shadow=0;"
        "dashed=0;fontColor=#4277BB;labelBackgroundColor=default;fontSize=11;spacingTop=3;"
        "image=https://app.diagrams.net/img/lib/ibm/blockchain/wallet.svg;"
    ),
    "smart_contract": (
        "image;aspect=fixed;perimeter=ellipsePerimeter;html=1;align=center;shadow=0;"
        "dashed=0;fontColor=#4277BB;labelBackgroundColor=default;fontSize=11;spacingTop=3;"
        "image=https://app.diagrams.net/img/lib/ibm/blockchain/smart_contract.svg;"
    ),
}
